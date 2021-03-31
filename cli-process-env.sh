#!/bin/bash

NETWORK="$1"
ENV_VALUE="$2"
FORCE_REWRITE="$3"

if [ -z "$NETWORK" ]; then
  NETWORK="mainnet"
fi

if [ -z "$ENV_VALUE" ]; then
  ENV_VALUE="dev"
fi

if [ -z "$FORCE_REWRITE" ]; then
  SKIP=true
else
  SKIP=false
fi

FILE=".env"

echo "CLI: Checking env... \r\n"
if [ -f "$FILE" ]; then
  echo ".env found"
else
  echo "setting “rinkeby” .env"
  SKIP=false
fi

if [ SKIP ]; then
  exit 0;
fi

GIT_VERSION="APP_GIT_VERSION=$(git tag -l | tail -n1)"
GIT_REVISION="APP_GIT_REVISION=$(git rev-parse --short HEAD)"
GIT_UPDATED_AT="APP_GIT_UPDATED_AT=\"$(git log -1 --format=%cd)\""
APP_ENV="APP_ENV=$ENV_VALUE"

rm -f .env src/.env &&
  cp "environments/.env.$NETWORK" ".env" &&
  echo "$GIT_VERSION" >>".env" &&
  echo "$GIT_REVISION" >>".env" &&
  echo "$GIT_UPDATED_AT" >>".env"
