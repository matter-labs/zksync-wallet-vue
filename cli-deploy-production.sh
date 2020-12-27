#!/bin/bash

git pull &&
git diff --quiet HEAD || (echo "There are uncommitted changes in the branch" && exit 1)

yarn ci &&
sh cli-process-env.sh "mainnet" &&
yarn generate --fail-on-error &&
firebase deploy -P zksync-vue-mainnet --only hosting &&
echo deployed successfully!
