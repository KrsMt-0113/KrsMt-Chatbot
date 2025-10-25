# 🎯 完整部署指南 - Complete Deployment Guide

## ✅ 已完成的工作

我已经将你的 Python 脚本 (`tst.py`) 转换为完整的 Web 应用程序！

### 创建的文件：
1. ✅ **worker.js** - Cloudflare Worker 后端（替代 Python 脚本）
2. ✅ **index.html** - 聊天机器人网页界面
3. ✅ **app.js** - 前端 JavaScript 逻辑
4. ✅ **style.css** - 漂亮的界面样式
5. ✅ **wrangler.toml** - Cloudflare 配置文件
6. ✅ **test.html** - 本地测试文件（已在浏览器中打开）
7. ✅ **deploy.sh** - 自动部署脚本
8. ✅ **README.md** - 详细文档
9. ✅ **QUICKSTART.md** - 快速开始指南
10. ✅ **SUMMARY.md** - 项目转换总结
11. ✅ **.gitignore** - Git 配置

---

## 🚀 现在开始部署！

### 第一步：安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 第二步：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，登录你的 Cloudflare 账号。

### 第三步：部署 Worker

```bash
cd /Users/wuqifeng/IdeaProjects/perplexity
wrangler deploy
```

### 第四步：设置 API 密钥

```bash
wrangler secret put PERPLEXITY_API_KEY
```

然后输入你的 API 密钥：
```
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
```

### 第五步：获取 Worker URL

部署成功后，你会看到类似这样的输出：
```
Published perplexity-chatbot (1.23 sec)
  https://perplexity-chatbot.你的账号.workers.dev
```

**复制这个 URL！**

### 第六步：配置前端

用你喜欢的编辑器打开 `app.js`，修改第 2 行：

```javascript
// 修改这行
const WORKER_URL = 'https://your-worker-name.your-account.workers.dev';

// 改成你的实际 Worker URL
const WORKER_URL = 'https://perplexity-chatbot.你的账号.workers.dev';
```

### 第七步：测试本地功能

在浏览器中打开 `test.html` 文件测试界面（已经打开了）。

### 第八步：部署到 GitHub Pages

#### 8.1 创建 GitHub 仓库
在 GitHub 上创建一个新仓库，例如：`ai-chatbot`

#### 8.2 推送代码
```bash
cd /Users/wuqifeng/IdeaProjects/perplexity

# 初始化 Git（如果还没有）
git init

# 添加文件（注意：不包含 .env 和 node_modules）
git add index.html app.js style.css README.md QUICKSTART.md .gitignore

# 提交
git commit -m "Add AI chatbot web application"

# 连接到 GitHub 仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/ai-chatbot.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

#### 8.3 启用 GitHub Pages
1. 在 GitHub 仓库页面，点击 **Settings**
2. 在左侧菜单找到 **Pages**
3. 在 **Source** 下拉框选择 **main** 分支
4. 文件夹选择 **/ (root)**
5. 点击 **Save**

等待 1-2 分钟，你的网站会在以下地址上线：
```
https://你的用户名.github.io/ai-chatbot/
```

---

## 🧪 测试部署

### 测试 Worker
```bash
# 使用 curl 测试
curl -X POST https://你的worker地址.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

### 测试网页
在浏览器中访问你的 GitHub Pages 地址，发送一条消息。

---

## 📂 项目结构

```
perplexity/
├── index.html          # 主网页
├── app.js             # 前端逻辑（需要配置 WORKER_URL）
├── style.css          # 样式
├── worker.js          # Cloudflare Worker 脚本
├── wrangler.toml      # Worker 配置
├── test.html          # 本地测试文件
├── deploy.sh          # 部署脚本
├── README.md          # 完整文档
├── QUICKSTART.md      # 快速指南
├── SUMMARY.md         # 转换总结
├── .gitignore         # Git 忽略配置
├── tst.py             # 原始 Python 脚本（保留）
└── .env               # API 密钥（不要提交到 Git！）
```

---

## 🎨 功能特性

✅ **流式响应** - AI 回复实时显示
✅ **对话历史** - 自动管理最近 10-20 条消息
✅ **响应式设计** - 支持手机、平板、桌面
✅ **现代化 UI** - 漂亮的渐变色和动画
✅ **安全** - API 密钥存储在 Worker 环境变量中
✅ **免费托管** - GitHub Pages + Cloudflare Workers
✅ **快捷键** - Enter 发送，Shift+Enter 换行
✅ **自动滚动** - 新消息自动滚动到视图

---

## ⚙️ 自定义选项

### 修改 AI 系统提示词
编辑 `worker.js` 第 37-39 行：
```javascript
content: '你自定义的系统提示词',
```

### 修改界面颜色
编辑 `style.css`，搜索 `#667eea` 和 `#764ba2` 替换为你喜欢的颜色。

### 修改 AI 模型
编辑 `worker.js` 第 58 行：
```javascript
model: 'sonar',  // 可选: sonar-pro, sonar-reasoning
```

---

## 🐛 常见问题

### Q: Worker 部署失败
```bash
# 重新登录
wrangler logout
wrangler login

# 清除缓存后重新部署
rm -rf .wrangler
wrangler deploy
```

### Q: 网页显示 "发生了错误"
1. 检查浏览器控制台（F12）的错误信息
2. 确认 `app.js` 中的 `WORKER_URL` 配置正确
3. 确认 Worker 已部署且设置了 API 密钥

### Q: Worker 返回 401 错误
```bash
# 重新设置 API 密钥
wrangler secret put PERPLEXITY_API_KEY
```

### Q: GitHub Pages 显示 404
等待几分钟让 GitHub 构建页面，然后刷新浏览器。

---

## 📞 获取帮助

查看详细文档：
- `README.md` - 完整文档
- `QUICKSTART.md` - 快速开始
- `SUMMARY.md` - 技术细节

---

## 🎉 完成检查清单

- [ ] 安装 Wrangler CLI
- [ ] 登录 Cloudflare
- [ ] 部署 Worker
- [ ] 设置 API 密钥
- [ ] 复制 Worker URL
- [ ] 配置 app.js 中的 WORKER_URL
- [ ] 测试本地界面（test.html）
- [ ] 创建 GitHub 仓库
- [ ] 推送代码到 GitHub
- [ ] 启用 GitHub Pages
- [ ] 测试完整功能

完成后，你就有了一个功能完整的 AI 聊天机器人网站！🚀

---

## 💡 下一步建议

1. **添加更多功能**
   - 清空对话按钮
   - 保存对话到本地
   - 深色模式切换
   - 多 AI 模型选择

2. **性能优化**
   - 添加请求缓存
   - 实现速率限制
   - 添加错误重试

3. **增强安全性**
   - 添加用户认证
   - 限制请求来源
   - 实现请求日志

4. **改进 UI**
   - 添加打字动画
   - 代码高亮显示
   - Markdown 渲染
   - 表情符号支持

---

**祝你部署顺利！** 🎊

如有任何问题，随时查看文档或在 GitHub Issues 中提问。

