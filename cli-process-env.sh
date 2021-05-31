#!/bin/bash

NETWORK="$1"
ENV_VALUE="$2"
FORCE_REWRITE="$3"
IS_LOCALHOST="$4"

# Colors
Red="\033[0;31m"     # Red
Default="\033[1;37m" # White
Green="\033[0;32m"   # Green
Blue="\033[0;34m"    # Blue
BBlue="\033[1;34m"   # Bold Blue

if [ -n $FORCE_REWRITE ]; then
  echo "${Red}Attention! Existing .env would be overridden"
fi

if [ -z $NETWORK ]; then
  NETWORK="rinkeby"
fi

if [ -z $ENV_VALUE ]; then
  ENV_VALUE="dev"
fi

FILE=".env"

echo "${BBlue}Chosen configuration... \n" "" "$NC"
echo "${Default}   Environment: $ENV_VALUE"
echo "   Ethereum network: $NETWORK"
printf "${Default}   Generate .env anyway:"
if [ -n $FORCE_REWRITE ]; then
  echo "${Red}yes"
else
  echo "${Green}nope"
fi

printf "${BBlue}\nCLI: Checking env...\n\n"
printf "${Default}   File status: "

if [ -e $FILE ]; then
  echo "${Green}.env found"
else
  echo "${Default} Configuring .env for $NETWORK ethereum network"
  FORCE_REWRITE=1
fi
echo ""
if [ -z $FORCE_REWRITE ]; then
  echo "${Red}Done!: Exiting without change..."
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

if [ -n $IS_LOCALHOST ]; then
  echo "${BBlue}Localhost detected:"
  echo ""
  echo "${Default}   Sentry: ${Red}Disabled"
  echo "${Default}   GTM: ${Red}Disabled"
  echo ""
  echo "IS_LOCALHOST=1" >> ".env"

fi

echo "${Green}Configured successfully ✅"
