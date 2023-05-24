#!/bin/bash

CATEGORY="$1"

ACTION="$2"

if [ "$CATEGORY" == "clean" ]; then
  if [ "$ACTION" == "yarn" ]; then
    echo "Yarn garbage collection started"
    echo ""
    echo "  - dropping node_modules folder..."
    rm -rf node_modules
    echo "    Done"
    echo "  - removing .yarn cached files..."
    rm -rf .yarn/cache .yarn/build-state.yml .yarn/install-state.gz
    echo "    Done"
    echo "  - cleaning yarn cache..."
    yarn cache clean --all
    printf "  Done\n\n"
    echo "All done!"
  elif [ "$ACTION" == "nuxt" ]; then
    echo "Nuxtjs garbage collection started"
    echo ""
    echo "  - dropping .nuxt folder..."
    rm -rf .nuxt
    echo "    Done"
    echo "  - cleaning the files inside public folder..."
    rm -rf public/*
    printf "  Done\n\n"
    echo "All done!"
  fi
fi

if [ "$CATEGORY" == "ci" ]; then
  if [ "$ACTION" == "force" ]; then
      echo "Running forced ci garbage collection..."
      echo ""
      bash cli-dev.sh clean nuxt
      echo ""
      bash cli-dev.sh clean yarn
      echo ""
    fi
  echo "Yarn pre-deploy garbage collection started"
  echo ""
  bash cli-dev.sh clean nuxt
  echo ""
  bash cli-dev.sh clean yarn
  echo ""
  echo "Running yarn install..."
  echo ""
  yarn install --check-cache
  echo ""
  echo "Done"
fi

if [ "$CATEGORY" == "dev" ]; then
  if [ "$ACTION" == "force" ]; then
    echo "Rebuilding..."
    echo ""
    bash cli-dev.sh ci
  fi
  echo "Generating static html"
  echo ""
  yarn ci:build:goerli
  echo "Deploying to the firebase host for a day"
  echo ""
  firebase hosting:channel:deploy totest --only stage-mainnet --expires 1d
  echo ""
fi