#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "🛡️ 正在啟動 Oathsworn 誓約者全套服務..."
echo "=========================================="

# 1. 停止既有服務
echo "1. 正在停止舊有進程..."
pkill -f "sync-server/server.js" 2>/dev/null || true
docker rm -f oathsworn-caddy 2>/dev/null || true

# 2. 啟動統一 Web + 帳號登入 & 即時同步伺服器 (Port 8082)
echo "2. 啟動統一 Web & 帳號同步伺服器 (Port 8082)..."
nohup node "$ROOT_DIR/sync-server/server.js" > "$ROOT_DIR/sync-server/server.log" 2>&1 &
echo $! > "$ROOT_DIR/sync-server/server.pid"

sleep 1

echo "=========================================="
echo "✅ 本機服務已全數就緒！"
echo "👉 本機網址: http://localhost:8082"
echo "=========================================="
echo ""
echo "4. 正在啟動 Cloudflare Tunnel 遠端外網穿透..."
echo "請複製終端機下方輸出的 https://xxxx.trycloudflare.com 網址即可分享給朋友！"
echo "（按 Ctrl + C 可隨時停止外網連線）"
echo "=========================================="

docker run --rm --net=host cloudflare/cloudflared:latest tunnel --url http://localhost:8082
