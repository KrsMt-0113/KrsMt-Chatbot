# AI 聊天机器人 - GitHub Pages + Cloudflare Worker

这是一个基于 Perplexity AI 的网页聊天机器人，使用 GitHub Pages 托管前端，Cloudflare Worker 处理后端 API 调用。

## 📁 文件结构

```
├── index.html          # 主页面
├── app.js             # 前端 JavaScript
├── style.css          # 样式文件
├── worker.js          # Cloudflare Worker 脚本
├── wrangler.toml      # Cloudflare 配置文件
└── README.md          # 说明文档
```

## 🚀 部署步骤

### 1. 部署 Cloudflare Worker

#### 方法一：使用 Wrangler CLI（推荐）

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler login
```

3. 部署 Worker：
```bash
wrangler deploy
```

4. 设置 API 密钥（重要！）：
```bash
wrangler secret put PERPLEXITY_API_KEY
# 然后输入你的 API 密钥: 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
```

#### 方法二：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages
3. 创建新的 Worker
4. 将 `worker.js` 的内容复制粘贴到编辑器
5. 点击 "Settings" → "Variables" → "Environment Variables"
6. 添加 `PERPLEXITY_API_KEY` 环境变量（选择 "Encrypt"）
7. 保存并部署

### 2. 配置前端

1. 复制 Worker 的 URL（例如：`https://perplexity-chatbot.your-account.workers.dev`）

2. 编辑 `app.js` 文件第 2 行，替换 Worker URL：
```javascript
const WORKER_URL = 'https://your-worker-name.your-account.workers.dev';
```

### 3. 部署到 GitHub Pages

1. 创建新的 GitHub 仓库

2. 上传文件到仓库：
```bash
git init
git add index.html app.js style.css README.md
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. 在 GitHub 仓库设置中：
   - 进入 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 和 "/ (root)"
   - 点击 Save

4. 等待几分钟，你的网站将在 `https://YOUR_USERNAME.github.io/YOUR_REPO/` 上线

## 🧪 本地测试

### 测试 Worker（本地）

```bash
# 使用 Wrangler 本地开发
wrangler dev

# Worker 将在 http://localhost:8787 运行
```

### 测试前端（本地）

使用任何静态服务器，例如：

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server

# 或使用 VS Code Live Server 插件
```

然后访问 `http://localhost:8000`

## 🔧 配置说明

### Worker 配置（wrangler.toml）

- `name`: Worker 名称
- `main`: 入口文件
- `compatibility_date`: 兼容日期

### 环境变量

- `PERPLEXITY_API_KEY`: Perplexity API 密钥（在 Cloudflare 中配置）

### 前端配置（app.js）

- `WORKER_URL`: Cloudflare Worker 的 URL
- 对话历史限制：默认保留最近 10 条消息发送给 API，最多存储 20 条

## 🎨 自定义

### 修改 AI 系统提示词

编辑 `worker.js` 第 37 行：
```javascript
content: '你自定义的系统提示词',
```

### 修改样式

编辑 `style.css` 文件，可以更改：
- 颜色主题（渐变色）
- 布局大小
- 字体样式
- 动画效果

### 修改 AI 模型

编辑 `worker.js` 第 58 行：
```javascript
model: 'sonar',  // 可选: sonar-pro, sonar-reasoning 等
```

## 📝 功能特性

✅ 流式响应（实时显示 AI 回复）
✅ 对话历史记录
✅ 移动端响应式设计
✅ 中文优化
✅ 优雅的加载动画
✅ 自动滚动到最新消息
✅ 支持多行输入（Shift+Enter 换行）

## 🔒 安全注意事项

⚠️ **重要**：不要在前端代码中暴露 API 密��！
- API 密钥只存储在 Cloudflare Worker 的环境变量中
- 前端只与 Worker 通信，不直接调用 Perplexity API
- Worker 处理所有 API 调用，保护密钥安全

## 🐛 故障排除

### Worker 返回 401 错误
- 检查 `PERPLEXITY_API_KEY` 环境变量是否正确设置
- 确认 API 密钥有效且未过期

### Worker 返回 CORS 错误
- 确认 Worker 代码中包含正确的 CORS 头
- 检查浏览器控制台的具体错误信息

### 消息发送后没有响应
- 打开浏览器开发者工具（F12）查看 Network 标签
- 检查 Worker URL 是否配置正确
- 确认 Worker 已成功部署

## 📞 技术支持

如有问题，请检查：
1. Cloudflare Worker 日志
2. 浏览器控制台错误信息
3. Network 请求详情

## 📄 许可证

MIT License

---

**祝使用愉快！** 🎉

