#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
source .env
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/708da8a58a29a3e65af33fa56a1bf7d9/purge_cache" \
  -H "Authorization: Bearer $CF_BEARER" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
