#!/bin/bash

NETWORK="$1"
ENV_VALUE="$2"
FORCE_REWRITE="$3"

echo "$FORCE_REWRITE"

if [[ -z "$NETWORK" ]]; then
  NETWORK="rinkeby"
fi

if [[ -z "$ENV_VALUE" ]]; then
  ENV_VALUE="dev"
fi

FILE=".env"

echo "Configure..."
echo "- Environment: $ENV_VALUE"
echo "- Ethereum network: $NETWORK"
echo "- Generate .env anyway : $FORCE_REWRITE"
echo ""

echo "CLI: Checking env..."
echo ""
if [ -e "$FILE" ]; then
  echo ".env found"
else
  echo "setting $NETWORK .env"
  FORCE_REWRITE=1
fi

if [ -z $FORCE_REWRITE ]; then
  echo "Exiting without change..."
  exit
fi

GIT_VERSION="APP_GIT_VERSION=$(git tag -l | tail -n1)"
GIT_REVISION="APP_GIT_REVISION=$(git rev-parse --short HEAD)"
GIT_UPDATED_AT="APP_GIT_UPDATED_AT=\"$(git log -1 --format=%cd)\""
APP_ENV="APP_ENV=$ENV_VALUE"

rm -f ./.env &&
  cp "environments/.env.$NETWORK" ".env" &&
  echo "$GIT_VERSION" >>".env" &&
  echo "$GIT_REVISION" >>".env" &&
  echo "$APP_ENV" >>".env" &&
  echo "$GIT_UPDATED_AT" >>".env"

echo "Configured successfully"
