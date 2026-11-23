#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTAINER_NAME="oathsworn-caddy"
PORT=8082

while [[ $# -gt 0 ]]; do
    case $1 in
        --port) PORT="$2"; shift 2 ;;
        -d|--detach) shift ;;
        --stop) docker stop "$CONTAINER_NAME" 2>/dev/null || true; exit 0 ;;
        *) shift ;;
    esac
done

docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

HOST_IP=$(hostname -I | awk '{print $1}')
cat << EOF > "$SCRIPT_DIR/Caddyfile"
:8082 {
    encode gzip

    @ws {
        path /ws /api/*
    }
    reverse_proxy @ws 172.17.0.1:8083

    root * /srv
    file_server
}
EOF

docker run -d --name "$CONTAINER_NAME" --restart unless-stopped --add-host host.docker.internal:host-gateway \
    -v "$SCRIPT_DIR/Caddyfile:/etc/caddy/Caddyfile:ro" \
    -v "$REPO_ROOT/web:/srv:ro" \
    -v "oathsworn-caddy-config:/config" \
    -p "${PORT}:${PORT}" \
    caddy:2-alpine
