#!/bin/bash
set -euo pipefail
source bamboo-specs/lib.sh

# Get values from Bamboo variables
default_env='non-bamboo-env'
build_number=${bamboo_buildNumber:-${default_env}}
agent_id=${bamboo_agentId:-${default_env}}
plan_name=${bamboo_planName:-${default_env}}
plan_key=${bamboo_planKey:-${default_env}}
current_branch=${bamboo_repository_git_branch:-${default_env}}

# Toggles of the deployment environments
deploy_to_production='true'
execute_sonarqube_analysis='true'

# Project-specific variables
persistent_branches='master'
project_key='NAW-ZKS'
project_description='zksync-demo'

# Build-specific variables
dockerfile_path="${PWD}/Dockerfile"
unmerged_branches=$(git for-each-ref --no-merged='remotes/origin/master' --format='%(refname:strip=2)' | sed 's?.*origin/??')
build_date=$(date +'%Y.%m.%d-%H.%M.%S')
revision=$(git rev-parse --short HEAD)

# Secrets
microscanner_token=$(cat /run/secrets/aqua_microscanner_token)
sonarqube_token=$(cat /run/secrets/sonarqube_token)
firebase_key=$(cat /run/secrets/firebase_key)
wallet_connect=$(cat /run/secrets/naw/zksync.matter/wallet-connect)
fortmatic=$(cat /run/secrets/naw/zksync.matter/fortmatic)
portis=$(cat /run/secrets/naw/zksync.matter/portis)

# Hosts
production_host="zksync-demo.firebaseapp.com"
sonarqube_host='https://sn.nodeart.app'

# Links
homepage='https://zksync-demo.firebaseapp.com'
bamboo='https://ci.nodeart.app/browse/NAW-ZKS'
jira='https://jira.nodeart.app/projects/NAW'
bitbucket='https://git.nodeart.app/scm/naw/zksync.matter.git'

if [[ "${deploy_to_production}" == 'true' ]] && [[ $(normalize_branch_name "${current_branch}") == 'master' ]]; then
  image_name=$(create_image_name ${dockerfile_path} 1 "${current_branch}")
  build_args=(
  "VIRTUAL_HOST=${production_host}"
  "FIREBASE_KEY=${firebase_key}"
  "INVALIDATE_CACHE=${build_date}"
  "REACT_APP_WALLET_CONNECT=${wallet_connect}"
  "REACT_APP_FORTMATIC=${fortmatic}"
  "REACT_APP_PORTIS=${portis}"
  )
  build_image \
    ${dockerfile_path} \
    ${image_name} \
    firebase-application \
    ${build_args[@]}
  docker rmi ${image_name}
  echo "Building and deployment completed successfully"
  echo "Please feel free to check out - ${production_host}"
fi

if [[ ${execute_sonarqube_analysis} == 'true' ]]; then
  image_name=$(create_image_name ${dockerfile_path} 1 "${current_branch}")
  build_args=(
    "MICROSCANNER_TOKEN=${microscanner_token:?err}"
    "INVALIDATE_CACHE=${build_date:?err}"
    "SONARQUBE_URL=${sonarqube_host:?err}"
    "SONARQUBE_TOKEN=${sonarqube_token:?err}"
    "SCM_REVISION=${revision:?err}"
    "LINK_HOMEPAGE=${homepage:?err}"
    "LINK_CI=${bamboo:?err}"
    "LINK_ISSUE=${jira:?err}"
    "LINK_SCM=${bitbucket:?err}"
    "PROJECT_KEY=${project_key:?err}"
    "PROJECT_NAME=${project_key:?err}"
    "PROJECT_VERSION=${revision:?err}"
    "PROJECT_DESCRIPTION=${project_description:?err}"
  )
  build_image \
    ${dockerfile_path} \
    ${image_name} \
    run-sonar-scanner \
    ${build_args[@]}
  echo "SonarQube analysis completed! Please feel free to check out - ${sonarqube_host}/dashboard?id=${project_key:?err}"
fi
