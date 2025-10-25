# 代码对比 - Code Comparison

## Python 原始代码 vs Web 应用代码

---

## 1️⃣ 初始化和配置

### ❌ Python (tst.py)
```python
from perplexity import Perplexity
from dotenv import load_dotenv

system_prompt = """You speak in Chinese. Answer without Markdown formatting. Answer without citation marks. Answer clearly."""

load_dotenv()
client = Perplexity()
```

### ✅ Cloudflare Worker (worker.js)
```javascript
export default {
  async fetch(request, env) {
    // env.PERPLEXITY_API_KEY 从环境变量自动注入
    // 更安全，不需要 .env 文件
```

**改进:**
- ✅ 环境变量由 Cloudflare 管理，更安全
- ✅ Serverless 架构，无需服务器维护
- ✅ 自动扩展，支持高并发

---

## 2️⃣ API 调用

### ❌ Python
```python
stream = client.chat.completions.create(
    model="sonar",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "What are the most popular open-source alternatives to OpenAI's GPT models?"}
    ],
    stream=True
)
```

### ✅ Worker
```javascript
const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'sonar',
        messages: messages,
        stream: true,
    }),
});
```

**改进:**
- ✅ 支持动态消息列表（对话历史）
- ✅ 更灵活的错误处理
- ✅ 支持 CORS，可从网页调用

---

## 3️⃣ 流式响应处理

### ❌ Python
```python
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### ✅ Worker
```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();

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
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
            } catch (e) {
                // Skip invalid JSON
            }
        }
    }
}
```

**改进:**
- ✅ 转换为 Server-Sent Events (SSE) 格式
- ✅ 更好的错误处理
- ✅ 适合网页实时显示

---

## 4️⃣ 前端显示

### ❌ Python（命令行）
```python
# 只能在终端显示
print(chunk.choices[0].delta.content, end="")
```

### ✅ Web 前端 (app.js)
```javascript
// 流式显示在网页上
const reader = response.body.getReader();
const decoder = new TextDecoder();
let fullResponse = '';

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
                if (parsed.content) {
                    fullResponse += parsed.content;
                    contentElement.textContent = fullResponse;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            } catch (e) {
                // Skip invalid JSON
            }
        }
    }
}
```

**改进:**
- ✅ 漂亮的聊天界面
- ✅ 实时流式显示
- ✅ 自动滚动到最新消息
- ✅ 支持对话历史

---

## 5️⃣ 用户交互

### ❌ Python（单次对话）
```python
# 硬编码的问题，每次运行只能问一个问题
{"role": "user", "content": "What are the most popular..."}
```

### ✅ Web（持续对话）
```javascript
// 用户可以持续输入多个问题
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 保存对话历史
conversationHistory.push({
    role: 'user',
    content: message
});

// 发送时包含历史
body: JSON.stringify({
    message: message,
    history: conversationHistory.slice(-10)
})
```

**改进:**
- ✅ 支持多轮对话
- ✅ 保存对话历史
- ✅ 快捷键支持（Enter 发送，Shift+Enter 换行）
- ✅ 自适应输入框

---

## 6️⃣ 错误处理

### ❌ Python（基本错误处理）
```python
# 依赖库的默认错误处理
# 错误会直接显示在终端
```

### ✅ Web（完善错误处理）
```javascript
// Worker 端
if (!response.ok) {
    const errorText = await response.text();
    return new Response(
        JSON.stringify({ error: `API error: ${response.status} - ${errorText}` }),
        {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        }
    );
}

// 前端
try {
    await streamResponse(message);
} catch (error) {
    console.error('Error:', error);
    addMessage('抱歉，发生了错误。请稍后再试。', 'bot', true);
}
```

**改进:**
- ✅ 友好的错误提示
- ✅ 详细的错误日志
- ✅ 优雅的降级处理

---

## 7️⃣ 安全性

### ⚠️ Python
```python
# .env 文件存储在本地
# API 密钥在代码中可见
load_dotenv()
```

### ✅ Web
```javascript
// Worker: 环境变量加密存储
const apiKey = env.PERPLEXITY_API_KEY;

// 前端: 不包含任何密钥
// 所有 API 调用通过 Worker 代理
```

**改进:**
- ✅ API 密钥加密存储在 Cloudflare
- ✅ 前端代码不包含任何敏感信息
- ✅ 支持 CORS 和其他安全策略

---

## 📊 功能对比总结

| 特性 | Python 版本 | Web 版本 |
|------|------------|----------|
| **运行环境** | 本地命令行 | 云端 + 浏览器 |
| **用户界面** | 终端文本 | 现代化网页 |
| **多轮对话** | ❌ | ✅ |
| **对话历史** | ❌ | ✅ 自动管理 |
| **流式响应** | ✅ | ✅ |
| **错误处理** | 基础 | 完善 |
| **安全性** | 本地密钥 | 加密环境变量 |
| **可访问性** | 仅本地 | 全球任何地方 |
| **移动端支持** | ❌ | ✅ 响应式设计 |
| **部署难度** | 无需部署 | 一次配置 |
| **维护成本** | 低 | 极低（Serverless） |
| **扩展性** | 单机 | 自动扩展 |
| **成本** | 免费 | 免费 |

---

## 🎯 代码行数对比

### Python 版本
- **tst.py**: ~23 行
- **功能**: 单次问答

### Web 版本
- **worker.js**: ~136 行
- **app.js**: ~160 行
- **index.html**: ~45 行
- **style.css**: ~220 行
- **总计**: ~561 行

**虽然代码量增加了，但功能提升巨大：**
- ✅ 完整的 Web 界面
- ✅ 流式响应处理
- ✅ 对话历史管理
- ✅ 响应式设计
- ✅ 优雅的动画
- ✅ 完善的错误处理
- ✅ 生产级代码质量

---

## 💡 性能对比

### Python 版本
- **启动时间**: ~2-3 秒
- **响应延迟**: 直接调用 API
- **并发支持**: 单线程

### Web 版本
- **启动时间**: Worker 冷启动 < 100ms
- **响应延迟**: 边缘计算，全球就近访问
- **并发支持**: 自动扩展，支持数千并发

---

## 🚀 总结

从一个简单的 Python 脚本到功能完整的 Web 应用：

**技术栈升级:**
```
Python + Perplexity SDK
         ↓
Cloudflare Workers + Vanilla JavaScript + HTML/CSS
         ↓
全栈 Web 应用
```

**架构升级:**
```
本地脚本
    ↓
分布式架构
    ↓
    前端: GitHub Pages (CDN)
    后端: Cloudflare Workers (边缘计算)
    API: Perplexity AI
```

**用户体验升级:**
```
命令行交互
    ↓
现代化 Web 界面
    ↓
    ✅ 漂亮的 UI
    ✅ 实时响应
    ✅ 移动端支持
    ✅ 全球访问
```

---

**这就是从原型到产品的完整转变！** 🎉

