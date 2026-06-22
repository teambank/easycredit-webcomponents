#!/usr/bin/env bash
set -euo pipefail

# Deploy storybook-static/ via SFTP (MaxCluster SFTP users have no shell; rsync won't work).
#
# Required:
#   STORYBOOK_DEPLOY_DST  user@host:/remote/path/  (e.g. in .env locally, or GitHub secret in CI)
#
# SSH key (one of):
#   STORYBOOK_DEPLOY_SSH_KEY       private key contents (GitHub Actions secret)
#   STORYBOOK_DEPLOY_SSH_KEY_FILE  path to private key file (e.g. ~/.ssh/storybook_deploy in .env)
#   (default)                      use ssh-agent / ~/.ssh/config

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${STORYBOOK_DEPLOY_DST:-}" ]; then
  echo "STORYBOOK_DEPLOY_DST is not set." >&2
  exit 1
fi

if [[ ! "$STORYBOOK_DEPLOY_DST" =~ ^([^@]+)@([^:]+):(.*)$ ]]; then
  echo "STORYBOOK_DEPLOY_DST must be user@host:/path/ (e.g. sftp-user-1@example.net:/easycredit-components/)." >&2
  exit 1
fi

DEPLOY_USER="${BASH_REMATCH[1]}"
DEPLOY_HOST="${BASH_REMATCH[2]}"
DEPLOY_PATH="${BASH_REMATCH[3]}"

if [ ! -d storybook-static ]; then
  echo "storybook-static/ not found. Run npm run storybook:build first." >&2
  exit 1
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp is required. Install with: brew install lftp (macOS) or apt install lftp (Linux)." >&2
  exit 1
fi

TEMP_KEY_FILE=""
cleanup() {
  if [ -n "$TEMP_KEY_FILE" ]; then
    rm -f "$TEMP_KEY_FILE"
  fi
}
trap cleanup EXIT

if [ -n "${STORYBOOK_DEPLOY_SSH_KEY:-}" ]; then
  TEMP_KEY_FILE="$(mktemp)"
  printf '%s\n' "$STORYBOOK_DEPLOY_SSH_KEY" > "$TEMP_KEY_FILE"
  chmod 600 "$TEMP_KEY_FILE"
  KEY_FILE="$TEMP_KEY_FILE"
elif [ -n "${STORYBOOK_DEPLOY_SSH_KEY_FILE:-}" ]; then
  KEY_FILE="${STORYBOOK_DEPLOY_SSH_KEY_FILE/#\~/$HOME}"
  if [ ! -f "$KEY_FILE" ]; then
    echo "SSH key file not found: $KEY_FILE" >&2
    exit 1
  fi
else
  KEY_FILE=""
fi

if [ -n "$KEY_FILE" ]; then
  SFTP_CONNECT_PROGRAM="ssh -a -x -i ${KEY_FILE} -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
else
  SFTP_CONNECT_PROGRAM="ssh -a -x -o BatchMode=yes -o StrictHostKeyChecking=no"
fi

echo "Deploying storybook-static/ to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

# Trailing comma after username = empty password; required for key-based SFTP via lftp.
lftp <<EOF
set cmd:fail-exit yes
set sftp:connect-program "${SFTP_CONNECT_PROGRAM}"
open -u ${DEPLOY_USER}, sftp://${DEPLOY_HOST}
mirror --reverse --verbose storybook-static/ ${DEPLOY_PATH}
bye
EOF
