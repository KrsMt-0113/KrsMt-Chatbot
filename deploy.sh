#!/bin/bash

# 部署脚本 - Deploy script for Perplexity Chatbot

echo "🚀 开始部署 Perplexity AI 聊天机器人..."
echo ""

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler 未安装"
    echo "📦 正在安装 Wrangler..."
    npm install -g wrangler
else
    echo "✅ Wrangler 已安装"
fi

echo ""
echo "📋 部署步骤："
echo ""
echo "1️⃣  首先，让我们部署 Cloudflare Worker..."

# 部署 Worker
echo "正在部署 Worker..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Worker 部署成功！"
    echo ""
    echo "2️⃣  现在需要设置 API 密钥..."
    echo "请运行以下命令设置 Perplexity API 密钥："
    echo ""
    echo "  wrangler secret put PERPLEXITY_API_KEY"
    echo ""
    echo "3️⃣  获取你的 Worker URL："
    echo "  检查上面的输出，找到类似这样的 URL："
    echo "  https://perplexity-chatbot.your-account.workers.dev"
    echo ""
    echo "4️⃣  编辑 app.js 文件，更新 WORKER_URL 变量"
    echo ""
    echo "5️⃣  提交到 GitHub："
    echo "  git add ."
    echo "  git commit -m 'Deploy chatbot'"
    echo "  git push origin main"
    echo ""
    echo "6️⃣  在 GitHub 仓库设置中启用 GitHub Pages"
    echo ""
    echo "✨ 完成！"
else
    echo "❌ Worker 部署失败"
    echo "请检查错误信息并重试"
    echo ""
    echo "如果是首次使用 Wrangler，请先登录："
    echo "  wrangler login"
fi

