# 快速开始指南 - Quick Start Guide

## 🎯 目标
将 Python 脚本转换为网页版 AI 聊天机器人，部署到 GitHub Pages + Cloudflare Worker

## 📦 已创建的文件

✅ **worker.js** - Cloudflare Worker 后端脚本
✅ **index.html** - 网页主页面
✅ **app.js** - 前端 JavaScript 逻辑
✅ **style.css** - 网页样式
✅ **wrangler.toml** - Cloudflare 配置
✅ **README.md** - 详细文档
✅ **deploy.sh** - 部署脚本
✅ **.gitignore** - Git 忽略文件

## 🚀 三步部署

### 步骤 1: 部署 Cloudflare Worker

```bash
# 安装 Wrangler（如果还没安装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署 Worker
cd /Users/wuqifeng/IdeaProjects/perplexity
wrangler deploy

# 设置 API 密钥（重要！）
wrangler secret put PERPLEXITY_API_KEY
# 输入: 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
```

部署成功后，你会看到类似这样的 URL：
```
https://perplexity-chatbot.你的账号.workers.dev
```

**复制这个 URL！**

### 步骤 2: 配置前端

编辑 `app.js` 文件的第 2 行：

```javascript
// 将这行：
const WORKER_URL = 'https://your-worker-name.your-account.workers.dev';

// 改成你的实际 Worker URL：
const WORKER_URL = 'https://perplexity-chatbot.你的账号.workers.dev';
```

### 步骤 3: 部署到 GitHub Pages

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加文件
git add index.html app.js style.css README.md .gitignore

# 提交
git commit -m "Add AI chatbot for GitHub Pages"

# 连接到 GitHub 仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送
git branch -M main
git push -u origin main
```

然后在 GitHub 仓库中：
1. 进入 **Settings** → **Pages**
2. Source 选择 **main** 分支
3. 文件夹选择 **/ (root)**
4. 点击 **Save**

等待 1-2 分钟，你的网站将在以下地址上线：
```
https://你的用户名.github.io/你的仓库名/
```

## ✅ 验证部署

### 测试 Worker
```bash
curl -X POST https://你的worker地址.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

### 测试网页
在浏览器中打开你的 GitHub Pages 地址，发送一条消息测试。

## 🎨 自定义

### 修改系统提示词
编辑 `worker.js` 第 37-39 行

### 修改颜色主题
编辑 `style.css` 中的渐变色配置

### 修改 AI 模型
编辑 `worker.js` 第 58 行的 model 参数

## 🔍 故障排查

### Worker 部署失败
```bash
# 重新登录
wrangler logout
wrangler login

# 重新部署
wrangler deploy
```

### 网页无法连接到 Worker
1. 检查 app.js 中的 WORKER_URL 是否正确
2. 打开浏览器控制台（F12）查看错误
3. 确认 Worker 已成功部署并设置了 API 密钥

### 401 错误
```bash
# 重新设置 API 密钥
wrangler secret put PERPLEXITY_API_KEY
```

## 📞 需要帮助？

查看详细的 README.md 文件获取更多信息。

## 🎉 完成！

现在你有了一个完整的 AI 聊天机器人网站！

- ✅ 前端托管在 GitHub Pages（免费）
- ✅ 后端运行在 Cloudflare Workers（免费额度）
- ✅ 使用 Perplexity AI 提供智能对话
- ✅ 支持流式响应和对话历史
- ✅ 响应式设计，支持移动端

---

**下一步：**
- 添加更多功能（清空对话、保存历史等）
- 自定义界面主题
- 添加更多 AI 模型选项

