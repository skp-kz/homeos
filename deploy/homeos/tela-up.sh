#!/usr/bin/env bash
# Поднять HomeOS/tela обратно одной командой: Postgres → tela → Caddy, + автозапуск.
# Маршрут os.skp.kz → http://localhost:8780 в туннеле cloudflared — у Славы.
set -euo pipefail
sudo systemctl enable --now postgresql.service postgresql@17-main.service tela.service caddy.service
for i in $(seq 1 30); do curl -sf -o /dev/null http://127.0.0.1:8780/api/version && break; sleep 1; done
curl -s http://127.0.0.1:8780/api/version; echo
