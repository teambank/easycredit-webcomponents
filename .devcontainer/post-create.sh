#!/bin/sh
set -eu

apt-get update
apt-get install -y --no-install-recommends php-cli ca-certificates curl git
rm -rf /var/lib/apt/lists/*

cd /workspaces/easycredit-webcomponents
npm ci
