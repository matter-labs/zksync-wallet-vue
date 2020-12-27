#!/bin/bash

yarn ci &&
sh cli-process-env.sh "rinkeby" &&
yarn generate --fail-on-error &&
firebase deploy -P zksync-vue --only hosting &&
echo "https://stage.zksync.io (Rinkeby stage) deployed successfully!"
