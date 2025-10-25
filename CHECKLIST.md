# 🎯 部署进度跟踪

使用这个清单来跟踪你的部署进度。完成每一步后，在方框中打勾 ✓

---

## 准备阶段

- [ ] 已查看浏览器中打开的 test.html 测试界面
- [ ] 已阅读 DEPLOYMENT_GUIDE.md
- [ ] 已准备好 Cloudflare 账号（免费）
- [ ] 已准备好 GitHub 账号

---

## 第一阶段：部署 Cloudflare Worker

### 1. 安装工具
```bash
npm install -g wrangler
```
- [ ] Wrangler CLI 已安装

### 2. 登录 Cloudflare
```bash
wrangler login
```
- [ ] 已登录 Cloudflare 账号

### 3. 部署 Worker
```bash
cd /Users/wuqifeng/IdeaProjects/perplexity
wrangler deploy
```
- [ ] Worker 已成功部署
- [ ] 已记录 Worker URL: _______________________________

### 4. 设置 API 密钥
```bash
wrangler secret put PERPLEXITY_API_KEY
# 输入: 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
```
- [ ] API 密钥已设置

### 5. 测试 Worker
```bash
curl -X POST https://你的worker地址.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"message":"测试"}'
```
- [ ] Worker 测试成功（收到响应）

---

## 第二阶段：配置前端

### 6. 更新 Worker URL
编辑 `app.js` 第 2 行：
```javascript
const WORKER_URL = 'https://你的实际worker地址.workers.dev';
```
- [ ] app.js 中的 WORKER_URL 已更新

### 7. 本地测试（可选）
```bash
# 使用任意 HTTP 服务器
python -m http.server 8000
# 或
npx http-server
```
然后访问 http://localhost:8000
- [ ] 本地测试成功（能够发送消息并收到回复）

---

## 第三阶段：部署到 GitHub Pages

### 8. 创建 GitHub 仓库
- [ ] 在 GitHub 上创建了新仓库
- [ ] 仓库名称: _______________________________

### 9. 推送代码
```bash
git init
git add index.html app.js style.css README.md QUICKSTART.md DEPLOYMENT_GUIDE.md .gitignore
git commit -m "Add AI chatbot web application"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```
- [ ] 代码已推送到 GitHub

### 10. 启用 GitHub Pages
在 GitHub 仓库中：
1. Settings → Pages
2. Source: main branch
3. Folder: / (root)
4. Save

- [ ] GitHub Pages 已启用
- [ ] 网站 URL: _______________________________

### 11. 等待部署
等待 1-2 分钟
- [ ] GitHub Pages 部署完成（网站可访问）

---

## 第四阶段：测试和验证

### 12. 完整功能测试
访问你的 GitHub Pages URL
- [ ] 网页正常加载
- [ ] 界面显示正常
- [ ] 可以输入消息
- [ ] 可以发送消息
- [ ] 收到 AI 回复
- [ ] 流式响应工作正常
- [ ] 对话历史功能正常
- [ ] 移动端显示正常（可选）

---

## 完成！🎉

### 记录你的部署信息

**Worker URL:** _______________________________

**GitHub Pages URL:** _______________________________

**部署日期:** _______________________________

---

## 下一步（可选）

- [ ] 自定义样式（修改 style.css）
- [ ] 修改系统提示词（修改 worker.js）
- [ ] 添加清空对话按钮
- [ ] 添加深色模式
- [ ] 分享给朋友使用
- [ ] 在简历或作品集中展示

---

## 问题排查

遇到问题时：
1. 查看 DEPLOYMENT_GUIDE.md 的"常见问题"部分
2. 检查浏览器控制台（F12）的错误信息
3. 查看 Cloudflare Worker 日志
4. 确认所有 URL 配置正确

---

## 备注

在这里记录任何额外的笔记或遇到的问题：

_______________________________

_______________________________

_______________________________

---

**祝部署顺利！** 🚀

