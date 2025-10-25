// Cloudflare Worker script for Perplexity AI chatbot
// Deploy this to Cloudflare Workers

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse the request body
      const { message, history } = await request.json();

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Build messages array
      // 在 worker.js 中找到处理消息历史的部分,替换为:

      // 构建消息数组 - 确保 user 和 assistant 交替
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant named KrsMt Assistant. Provide clear and concise answers to user queries. Answer in Chinese.'
        }
      ];

      // 只添加最近的有效对话(确保交替)
      if (history && history.length > 0) {
        // 只保留最后 10 条消息
        const recentHistory = history.slice(-10);

        // 确保消息交替出现
        let lastRole = 'system';
        for (const msg of recentHistory) {
          if (msg.role === 'user' && lastRole !== 'user') {
            messages.push({ role: 'user', content: msg.content });
            lastRole = 'user';
          } else if (msg.role === 'assistant' && lastRole !== 'assistant') {
            messages.push({ role: 'assistant', content: msg.content });
            lastRole = 'assistant';
          }
        }
      }

      // 添加当前用户消息
      messages.push({
        role: 'user',
        content: message
      });

      // Call Perplexity API with streaming
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

      // Create a TransformStream to handle the streaming response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Process the stream
      (async () => {
        try {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last incomplete line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6);

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  console.error('Parse error:', e, 'Line:', data);
                }
              }
            }
          }

          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Stream error:', error);
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      // Return the streaming response
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

