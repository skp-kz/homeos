#!/usr/bin/env bash
# Сборка и установка HomeOS без Docker: Go-бэкенд + Vite-фронт → /opt/homeos, systemd + Caddy.
set -euo pipefail
cd "$(dirname "$0")/../.."
export PATH=$PATH:/usr/local/go/bin
VER=$(git describe --tags --always --dirty 2>/dev/null || echo dev)
COMMIT=$(git rev-parse --short HEAD)

# 1. Сборка
(cd backend && go build -trimpath -ldflags "-s -w -X github.com/zcag/tela/backend/internal/api.Version=$VER -X github.com/zcag/tela/backend/internal/api.Commit=$COMMIT -X github.com/zcag/tela/backend/internal/api.BuildTime=$(date -u +%FT%TZ)" -o ../bin/tela ./cmd/tela)
(cd frontend && npm ci --no-audit --no-fund && npm run build)

# 2. Системный пользователь и БД (peer-auth по unix-сокету — без пароля)
id tela >/dev/null 2>&1 || sudo useradd --system --home /var/lib/homeos --shell /usr/sbin/nologin tela
sudo -u postgres psql -qtAc "select 1 from pg_roles where rolname='tela'" | grep -q 1 || sudo -u postgres createuser tela
sudo -u postgres psql -qtAc "select 1 from pg_database where datname='tela'" | grep -q 1 || sudo -u postgres createdb -O tela tela
sudo -u postgres psql -q -d tela -c "create extension if not exists vector;"

# 3. Раскладка
sudo install -d -o root -g root /opt/homeos/bin /opt/homeos/web
sudo install -m 0755 bin/tela /opt/homeos/bin/tela
sudo rsync -a --delete frontend/dist/ /opt/homeos/web/
echo "$VER $COMMIT" | sudo tee /opt/homeos/VERSION >/dev/null
sudo install -d -m 0755 -o root -g root /etc/homeos
[ -f /etc/homeos/env ] || { sudo install -m 0600 -o root -g root /dev/null /etc/homeos/env; echo "!! /etc/homeos/env пуст — секреты кладёт Слава (см. env.example)"; }

# 4. systemd + Caddy
sudo install -m 0644 deploy/homeos/tela.service /etc/systemd/system/tela.service
sudo install -m 0644 deploy/homeos/Caddyfile /etc/caddy/Caddyfile
sudo systemctl daemon-reload
sudo systemctl enable tela.service caddy.service
sudo systemctl reload-or-restart caddy
sudo systemctl restart tela.service || true
