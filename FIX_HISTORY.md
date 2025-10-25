# 🔧 修复消息交替错误

## 问题原因

之前的代码在发送请求**之前**就将用户消息添加到历史记录中：

```javascript
// ❌ 错误的方式
conversationHistory.push({
    role: 'user',
    content: message  // 先添加到历史
});

// 然后发送请求，历史中已经包含了当前消息
body: JSON.stringify({
    message: message,      // 当前消息
    history: conversationHistory  // 历史中也有当前消息！
})
```

这导致 Worker 接收到：
- `history`: [... 之前的对话, **当前用户消息**]
- `message`: **当前用户消息**（重复）

Worker 会将当前消息再次添加到末尾，导致出现连续两条 user 消息，违反了 Perplexity API 的要求。

## 解决方案

✅ **正确的方式：**

1. **发送请求时** - 只发送之前的历史，不包含当前消息
2. **收到响应后** - 按顺序添加 user 消息和 assistant 回复

```javascript
// ✅ 正确的方式
async function streamResponse(message) {
    // 1. 发送请求 - 历史不包含当前消息
    const response = await fetch(WORKER_URL, {
        body: JSON.stringify({
            message: message,                      // 当前消息
            history: conversationHistory.slice(-10) // 只有之前的历史
        })
    });
    
    // 2. 处理响应...
    let fullResponse = '';
    // ... 流式接收 ...
    
    // 3. 收到完整响应后，按顺序添加到历史
    conversationHistory.push({
        role: 'user',
        content: message
    });
    conversationHistory.push({
        role: 'assistant',
        content: fullResponse
    });
}
```

## 消息流程图

### ❌ 之前（错误）

```
第一轮对话:
conversationHistory: []
发送: message="你好", history=[]
Worker 构建: [system, user="你好"]  ✅ 正确
收到响应: "你好！"
conversationHistory: [user="你好", assistant="你好！"]

第二轮对话:
conversationHistory: [user="你好", assistant="你好！", user="今天天气"] ❌ 提前添加了！
发送: message="今天天气", history=[user="你好", assistant="你好！", user="今天天气"]
Worker 构建: [system, user="你好", assistant="你好！", user="今天天气", user="今天天气"]
                                                         ↑ 重复了！
结果: ❌ 400 错误 - user 消息连续出现
```

### ✅ 现在（正确）

```
第一轮对话:
conversationHistory: []
发送: message="你好", history=[]
Worker 构建: [system, user="你好"]  ✅
收到响应: "你好！"
conversationHistory: [user="你好", assistant="你好！"]  ✅

第二轮对话:
conversationHistory: [user="你好", assistant="你好！"]  ✅ 不包含当前消息
发送: message="今天天气", history=[user="你好", assistant="你好！"]
Worker 构建: [system, user="你好", assistant="你好！", user="今天天气"]  ✅ 完美交替
收到响应: "今天多云..."
conversationHistory: [user="你好", assistant="你好！", user="今天天气", assistant="今天多云..."]  ✅
```

## 已修复的内容

### app.js 的改动

1. **移除了提前添加用户消息**
   ```javascript
   // 删除了这行：
   // conversationHistory.push({ role: 'user', content: message });
   ```

2. **在收到响应后按顺序添加**
   ```javascript
   // 添加用户消息和 bot 回复到历史（按正确顺序）
   conversationHistory.push({
       role: 'user',
       content: message
   });
   conversationHistory.push({
       role: 'assistant',
       content: fullResponse
   });
   ```

3. **添加了调试日志**
   ```javascript
   console.log('Sending to worker:', JSON.stringify(requestBody, null, 2));
   ```

4. **改进了错误提示**
   ```javascript
   contentElement.textContent = `抱歉，获取响应时出错了。错误: ${error.message}`;
   ```

## 测试步骤

1. **打开浏览器开发者工具**（F12）
2. **切换到 Console 标签**
3. **刷新页面**
4. **发送第一条消息** - 应该正常工作
5. **继续发送第二、三条消息** - 测试多轮对话
6. **查看 Console 日志** - 确认发送的数据格式正确

### 预期的 Console 输出

```
Sending to worker: {
  "message": "你好",
  "history": []
}

Sending to worker: {
  "message": "今天天气怎么样",
  "history": [
    {
      "role": "user",
      "content": "你好"
    },
    {
      "role": "assistant",
      "content": "你好！我是你的 AI 助手..."
    }
  ]
}
```

## 验证消息交替

每次发送请求时，检查 `history` 数组：
- ✅ user, assistant, user, assistant... （正确交替）
- ❌ user, user 或 assistant, assistant （连续相同角色）

## 如果还有问题

1. **清空浏览器缓存** - 确保加载了最新的 app.js
2. **硬刷新页面** - Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
3. **检查 Console 日志** - 查看发送的实际数据
4. **查看 Network 标签** - 检查请求和响应详情

## 完成！

现在对话历史的管理完全正确，不会再出现消息交替错误！

**刷新页面并测试多轮对话吧！** 🎉

