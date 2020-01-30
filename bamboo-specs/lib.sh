#!/bin/bash
set -euo pipefail
export TZ=Europe/Kiev

# Connect to the running container with the lighthouse binary
generate_lighthouse_report () {
    local domain=${1}
    local output_path=${2}
    local host="Atlassian_lighthouse"
    local default_flags="--headless --disable-gpu --no-sandbox"
    docker exec ${host} \
    lighthouse --quiet --output-path='stdout' \
    --chrome-flags="${default_flags}" \
    ${domain} > ${output_path}
}

# Extract aqua microscanner reports from the container image
extract_file () {
    local image_name=${1}
    local file_path=${2}
    local output_path=${3}
    local container_id=$(docker create ${image_name})
    docker cp ${container_id}:${file_path} ${output_path} || true
    docker rm ${container_id}
}

# Normalize branch name to fit the docker swarm naming conventions for container image name
normalize_branch_name () {
    local branch_name=${1}
    echo $(echo "${branch_name}" | sed -r 's/[/]+/-/g')
}

# Retrieve information to construct name of the container image
create_image_name () {
    local dockerfile_path=${1}
    local service_position=${2}
    local branch_name=${3}
    local tag="$(normalize_branch_name "${branch_name}")"
    local registry=$(sed -nr "s/.*.registry=\"(.*?)\".*/\1/p" ${dockerfile_path} | sed -n "${service_position}{p;q}")
    local namespace=$(sed -nr "s/.*.namespace=\"(.*?)\".*/\1/p" ${dockerfile_path} | sed -n "${service_position}{p;q}")
    local repository=$(sed -nr "s/.*.repository=\"(.*?)\".*/\1/p" ${dockerfile_path} | sed -n "${service_position}{p;q}")
    local component=$(sed -nr "s/.*.component=\"(.*?)\".*/\1/p" ${dockerfile_path} | sed -nr "${service_position}{p;q}")
    local project=$(sed -nr "s/.*.project=\"(.*?)\".*/\1/p" ${dockerfile_path} | sed -n "${service_position}{p;q}")
    echo "${registry}/${namespace}/${project}/${repository}/${component}:${tag}"
}

build_image () {
    # Set values according to the positional arguments
    local dockerfile_path=${1}
    local image_name=${2}
    local target=${3}
    local build_args=(${@:3})
    # Retrieve metadata to apply labels to the container image
    local tag=$(echo "${image_name}" |sed -r "s/(.*)://")
    local revision=$(git rev-parse --short HEAD)
    local authors=$(git log --pretty='tformat:'%ae'' -- ${dockerfile_path} | sort -u | sed ':a;N;$!ba;s/\n/,/g;s/,/, /g')
    docker build \
        $(for build_arg in ${build_args[@]}; do echo "--build-arg ${build_arg}"; done) \
        --label "org.opencontainers.image.revision=${revision}" \
        --label "org.opencontainers.image.created=${build_date}" \
        --label "org.opencontainers.image.build-number=${build_number}" \
        --label "org.opencontainers.image.agent-id=${agent_id}" \
        --label "org.opencontainers.image.plan-key=${plan_key}" \
        --label "org.opencontainers.image.ref.name=${tag}" \
        --label "org.opencontainers.image.authors=${authors}" \
        --target "${target}" \
        --tag "${image_name}" \
        --file "${dockerfile_path}" \
        "${PWD}"
}
