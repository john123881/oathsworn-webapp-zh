#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="/tmp/oathsworn-gh-pages"
REMOTE_URL="$(git -C "$ROOT_DIR" remote get-url origin)"

echo "📦 正在準備部署檔案至 GitHub Pages（排除 web/data/audio 音訊檔）..."
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

rsync -a --exclude='data/audio' "$ROOT_DIR/web/" "$TMP_DIR/"
touch "$TMP_DIR/.nojekyll"

cd "$TMP_DIR"
git init -q
git checkout -b gh-pages
git add -A
git commit -q -m "deploy: publish web/ (excluding audio) to gh-pages"
git remote add origin "$REMOTE_URL"

echo "🚀 正在推送至 gh-pages 分支..."
git push -f origin gh-pages

rm -rf "$TMP_DIR"
echo "✅ 發佈完成！請至 GitHub Settings -> Pages 確認 Branch 已設為 gh-pages。"
