#!/bin/sh
set -e

WEB_PORT="${WEB_PORT:-8088}"

node /app/scripts/prerender-server/master.cjs &
NODE_PID=$!

php -S "0.0.0.0:${WEB_PORT}" -t /app/scripts/prerender-server /app/scripts/prerender-server/router.php &
PHP_PID=$!

cleanup() {
  kill "$NODE_PID" "$PHP_PID" 2>/dev/null || true
  wait "$NODE_PID" "$PHP_PID" 2>/dev/null || true
}
trap cleanup TERM INT

wait "$PHP_PID"
cleanup
