#!/bin/bash

yarn ci &&
sh cli-process-env.sh "rinkeby" &&
yarn generate --fail-on-error
firebase deploy -P zksync-vue-mainnet --only hosting
