#!/bin/bash

NETWORK="$1"

if [ -z "$NETWORK" ]
then
   NETWORK="mainnet";
fi

GIT_VERSION="APP_GIT_VERSION=$(git tag -l|tail -n1)"
GIT_REVISION="APP_GIT_REVISION=$(git rev-parse --short HEAD)"
GIT_UPDATED_AT="APP_GIT_UPDATED_AT=\"$(git log -1 --format=%cd)\""

rm -f .env src/.env &&
cp "environments/.env.$NETWORK" ".env" &&
cp "environments/.env.$NETWORK" "src/.env" &&

echo "$GIT_VERSION" >> ".env" &&
echo "$GIT_VERSION" >> "src/.env" &&

echo "$GIT_REVISION" >> ".env" &&
echo "$GIT_REVISION" >> "src/.env" &&

echo "$GIT_UPDATED_AT" >> ".env" &&
echo "$GIT_UPDATED_AT" >> "src/.env"
