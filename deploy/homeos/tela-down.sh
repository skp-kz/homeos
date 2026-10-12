#!/usr/bin/env bash
# Выключить HomeOS/tela (os.skp.kz), ничего не удаляя: сервисы стоп + из автозапуска.
# Пакеты, /opt/homeos, ~/work/homeos и данные Postgres остаются. Вернуть: ./tela-up.sh
set -euo pipefail
sudo systemctl disable --now tela.service caddy.service postgresql.service postgresql@17-main.service
systemctl is-enabled tela caddy postgresql postgresql@17-main || true
