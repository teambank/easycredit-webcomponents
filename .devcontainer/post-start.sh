#!/bin/sh
set -eu

cd /workspaces/easycredit-webcomponents

if [ ! -d node_modules/@stencil/core ]; then
  npm ci
fi

npx stencil build

pkill -f 'scripts/prerender-server/master.cjs' || true
pkill -f 'scripts/prerender-server/server.cjs' || true
pkill -f 'scripts/prerender-server/router.php' || true
sleep 0.3

export PRERENDER_HOST="${PRERENDER_HOST:-0.0.0.0}"
export PRERENDER_PORT="${PRERENDER_PORT:-4711}"
export WEB_PORT="${WEB_PORT:-8088}"

nohup node scripts/prerender-server/master.cjs >/tmp/prerender.log 2>&1 &
nohup php -S "0.0.0.0:${WEB_PORT}" -t scripts/prerender-server scripts/prerender-server/router.php >/tmp/static.log 2>&1 &

i=0
while [ "$i" -lt 20 ]; do
  if curl -fsS "http://127.0.0.1:${PRERENDER_PORT}/health" >/dev/null \
    && curl -fsS -o /dev/null "http://127.0.0.1:${WEB_PORT}/easycredit-components/easycredit-components.esm.js"
  then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done

echo 'prerender or static server did not become ready' >&2
echo '--- prerender log ---' >&2
cat /tmp/prerender.log >&2 || true
echo '--- static log ---' >&2
cat /tmp/static.log >&2 || true
exit 1
