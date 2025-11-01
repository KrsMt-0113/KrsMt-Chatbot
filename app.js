// 配置你的 Cloudflare Worker URL
// 本地测试: http://localhost:3000
// 生产环境: https://perplexity-chatbot.krsmt0113.workers.dev
const WORKER_URL = 'https://perplexity-chatbot.krsmt0113.workers.dev';

// 存储对话历史
let conversationHistory = [];

// 配置 marked.js
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,  // 支持 GitHub 风格的换行
        gfm: true,     // 启用 GitHub Flavored Markdown
        headerIds: true,
        mangle: false
    });
}

// DOM 元素
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);

    // 回车发送消息（Shift+Enter 换行）
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自动调整输入框高度
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    });
});

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    // 禁用输入
    userInput.disabled = true;
    sendButton.disabled = true;

    // 显示用户消息
    addMessage(message, 'user');

    // 清空输入框
    userInput.value = '';
    userInput.style.height = 'auto';

    // 显示加载指示器
    loadingIndicator.style.display = 'flex';

    try {
        // 调用 Cloudflare Worker
        await streamResponse(message);
    } catch (error) {
        console.error('Error:', error);
        addMessage('抱歉，发生了错误。请稍后再试。', 'bot', true);
    } finally {
        // 隐藏加载指示器
        loadingIndicator.style.display = 'none';

        // 重新启用输入
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// 流式响应处理
async function streamResponse(message) {
    // 创建 bot 消息容器
    const messageElement = addMessage('', 'bot');
    const contentElement = messageElement.querySelector('.message-content');

    try {
        // 发送请求时，只包含之前的历史，不包含当前消息
        // Worker 会自动添加当前消息
        const requestBody = {
            message: message,
            history: conversationHistory.slice(-10) // 只发送最近10条历史消息（不包含当前）
        };

        console.log('Sending to worker:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Worker error:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let citations = null;

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);

                        // Capture citations if present
                        if (parsed.citations) {
                            citations = parsed.citations;
                            console.log('Received citations:', citations);
                        }

                        if (parsed.content) {
                            fullResponse += parsed.content;
                            // 渲染 Markdown 和 LaTeX，并处理引用
                            renderMarkdown(contentElement, fullResponse, citations);

                            // 自动滚动到底部
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {
                        // 跳过无效的 JSON
                    }
                }
            }
        }

        // 最后一次渲染，确保引用被正确处理
        if (citations) {
            renderMarkdown(contentElement, fullResponse, citations);
        }

        // 添加用户消息和 bot 回复到历史（按正确顺序）
        conversationHistory.push({
            role: 'user',
            content: message
        });
        conversationHistory.push({
            role: 'assistant',
            content: fullResponse
        });

        // 限制历史记录长度
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

    } catch (error) {
        console.error('Stream error:', error);
        contentElement.textContent = `抱歉，获取响应时出错了。错误: ${error.message}`;
        throw error;
    }
}

// 渲染 Markdown 和 LaTeX
function renderMarkdown(element, text, citations = null) {
    if (!text) {
        element.innerHTML = '';
        return;
    }

    console.log('Rendering text:', text.substring(0, 200)); // 显示前200个字符
    if (citations) {
        console.log('With citations:', citations.length);
    }

    try {
        // 先保护 LaTeX 公式，避免被 Markdown 处理
        let processedText = text;
        const latexBlocks = [];
        let blockIndex = 0;

        // 保护块级公式 $$...$$
        processedText = processedText.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
            const placeholder = `<!--LTXBLK${blockIndex}-->`;
            latexBlocks.push({ placeholder, content: match });
            blockIndex++;
            return placeholder;
        });

        // 保护行内公式 $...$（确保不是 $$）
        processedText = processedText.replace(/\$([^\$\n]+?)\$/g, (match) => {
            const placeholder = `<!--LTXINL${blockIndex}-->`;
            latexBlocks.push({ placeholder, content: match });
            blockIndex++;
            return placeholder;
        });

        // 保护 LaTeX 括号形式
        processedText = processedText.replace(/\\\[([\s\S]+?)\\\]/g, (match) => {
            const placeholder = `<!--LTXBRK${blockIndex}-->`;
            latexBlocks.push({ placeholder, content: match });
            blockIndex++;
            return placeholder;
        });

        processedText = processedText.replace(/\\\(([\s\S]+?)\\\)/g, (match) => {
            const placeholder = `<!--LTXPAR${blockIndex}-->`;
            latexBlocks.push({ placeholder, content: match });
            blockIndex++;
            return placeholder;
        });

        // 处理引用 - 在 Markdown 渲染之前
        const citationPlaceholders = [];
        if (citations && citations.length > 0) {
            processedText = processedText.replace(/\[(\d+)\]/g, (match, num) => {
                const index = parseInt(num) - 1;
                const url = citations[index];

                if (url) {
                    // 使用更安全的占位符格式，避免 URL 特殊字符干扰
                    const placeholderId = `CITE_PLACEHOLDER_${num}_${citationPlaceholders.length}`;
                    citationPlaceholders.push({ id: placeholderId, num: num, url: url });
                    return `<!--${placeholderId}-->`;
                }
                return match; // 保持原样如果引用不存在
            });
        }

        // 使用 marked 渲染 Markdown
        if (typeof marked !== 'undefined') {
            element.innerHTML = marked.parse(processedText);
        } else {
            element.textContent = processedText;
        }

        // 恢复 LaTeX 占位符
        let html = element.innerHTML;
        console.log('Extracted LaTeX blocks:', latexBlocks.length);
        latexBlocks.forEach(block => {
            console.log('Restoring:', block.placeholder, '→', block.content);
            html = html.replace(block.placeholder, block.content);
        });

        // 恢复引用占位符为 HTML 按钮
        if (citations && citations.length > 0) {
            console.log('Restoring citations:', citationPlaceholders.length);
            citationPlaceholders.forEach(({ id, num, url }) => {
                // 处理 HTML 编码的占位符
                const encodedPlaceholder = `&lt;!--${id}--&gt;`;
                const normalPlaceholder = `<!--${id}-->`;

                // 创建引用链接（只显示数字，无方括号）
                const citationLink = `<a href="${url}" target="_blank" class="citation-link" title="${url}">${num}</a>`;

                // 替换两种可能的格式
                html = html.replace(encodedPlaceholder, citationLink);
                html = html.replace(normalPlaceholder, citationLink);

                console.log(`Replaced citation [${num}] -> ${url.substring(0, 50)}...`);
            });
        }

        element.innerHTML = html;

        console.log('Before KaTeX render:', element.innerHTML.substring(0, 200));

        // 渲染 LaTeX 数学公式
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(element, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},   // 块级公式
                    {left: '$', right: '$', display: false},    // 行内公式
                    {left: '\\[', right: '\\]', display: true}, // LaTeX 块级
                    {left: '\\(', right: '\\)', display: false} // LaTeX 行内
                ],
                throwOnError: false,
                strict: false,
                trust: true
            });
        }
        if (typeof hljs !== 'undefined') {
            setTimeout(() => {
                element.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 0);
        }
    } catch (e) {
        console.error('Render error:', e);
        element.textContent = text;
    }
}

// 添加消息到聊天界面
function addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${isError ? 'error-message' : ''}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Bot 消息支持 Markdown 渲染，用户消息使用纯文本
    if (sender === 'bot' && !isError) {
        renderMarkdown(contentDiv, text);
    } else {
        contentDiv.textContent = text;
    }

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

// 清空对话历史
function clearHistory() {
    conversationHistory = [];
    // chatMessages.innerHTML = `
    //     <div class="message bot-message">
    //         <div class="message-content">
    //             你好！我是你的 AI 助手。有什么我可以帮助你的吗？
    //         </div>
    //     </div>
    // `;
}

