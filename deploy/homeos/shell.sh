#!/usr/bin/env bash
# Сборка и выкладка оболочки HomeOS (apps/shell) → /opt/homeos/shell.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -d node_modules ] || npm ci --no-audit --no-fund
npm run build -w @homeos/shell --silent
sudo install -d -o root -g root /opt/homeos/shell
sudo rsync -a --delete apps/shell/dist/ /opt/homeos/shell/
grep -oE '/shell/assets/index-[A-Za-z0-9_-]+\.js' apps/shell/dist/index.html
