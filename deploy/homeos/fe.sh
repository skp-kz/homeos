#!/usr/bin/env bash
# Быстрая выкладка только фронтенда: vite build → /opt/homeos/web (бэкенд не трогает).
set -euo pipefail
cd "$(dirname "$0")/../../frontend"
[ -d node_modules ] || npm ci --no-audit --no-fund
npm run build --silent
sudo rsync -a --delete dist/ /opt/homeos/web/
grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' dist/index.html
