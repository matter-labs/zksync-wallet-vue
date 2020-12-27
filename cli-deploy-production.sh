#!/bin/bash

yarn ci &&
sh cli-process-env.sh "mainnet" &&
yarn generate --fail-on-error
firebase use zksync-vue-mainnet
firebase deploy --only hosting
