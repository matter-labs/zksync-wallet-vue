# syntax = docker/dockerfile:1.1.3-experimental

FROM hotline.nodeart.app/naw/rnn/particles/lighthouse:1.0.3 AS generate-lighthouse-report
ARG INVALIDATE_CACHE
ARG HOSTNAME
RUN lighthouse --quiet --output-path='stdout' --plugins=lighthouse-plugin-field-performance \
    --chrome-flags="--headless --disable-gpu --no-sandbox" "https://${HOSTNAME}" > lighthouse.html

FROM hotline.nodeart.app/naw/rnn/particles/sonar-scanner:1.0.0 AS sonar-scanner

FROM node:13.7.0-stretch AS prepare-base-stage
WORKDIR /opt/app
ENV NODE_OPTIONS='--max_old_space_size=8192'

FROM prepare-base-stage AS prepare-build-environment
ENV NODE_ENV='production'

FROM prepare-base-stage AS enable-package-caching
RUN rm -f /etc/apt/apt.conf.d/docker-clean; \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

FROM enable-package-caching AS install-system-dependencies
ENV DEBIAN_FRONTEND='noninteractive' \
    BUILD_DEPS='build-essential'
RUN --mount=type=cache,target=/var/cache/apt,id=apt-cache_cache \
    --mount=type=cache,target=/var/lib/apt,id=apt-lib_cache \
    apt -y update && apt -y install --no-install-recommends $BUILD_DEPS

FROM install-system-dependencies AS install-latest-npm
RUN --mount=type=cache,target=/root/.npm,id=npm_cache \
    --mount=type=cache,target=/tmp,id=npm_releases \
    npm --prefer-offline install npm --global --silent

FROM prepare-base-stage AS list-npm-settings
ARG INVALIDATE_CACHE
RUN npm config list --json > npm.json

FROM install-latest-npm AS install-dependencies
ENV GATSBY_TELEMETRY_DISABLED='1'
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,id=npm_cache \
    npm --prefer-offline ci --silent

FROM install-latest-npm AS audit-dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-dependencies \
    npm run audit_dependencies

FROM install-latest-npm AS check-licenses
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-dependencies \
    npm run check_licenses

FROM install-system-dependencies AS prepare-sonar-scanner-environment
WORKDIR /opt/app/src
ARG SONARQUBE_URL
ARG SONARQUBE_TOKEN
ARG SCM_REVISION
ARG LINK_HOMEPAGE
ARG LINK_CI
ARG LINK_ISSUE
ARG LINK_SCM
ARG PROJECT_KEY
ARG PROJECT_NAME
ARG PROJECT_VERSION
ARG PROJECT_DESCRIPTION
ENV SONAR_SCANNER_OPTS="-Xms512m -Xmx4096m" \
    WORKING_DIRECTORY='-Dsonar.working.directory=/tmp/scannerwork' \
    SOURCE_ENCODING='-Dsonar.sourceEncoding=UTF-8' \
    SOURCE_DIRECTORY='-Dsonar.sources=/opt/app/src' \
    SCM_PROVIDER='-Dsonar.scm.provider=git' \
    SCM_FORCE_RELOAD='-Dsonar.scm.forceReloadAll=true' \
    SONARQUBE_URL="-Dsonar.host.url=${SONARQUBE_URL}" \
    SONARQUBE_TOKEN="-Dsonar.login=${SONARQUBE_TOKEN}" \
    SCM_REVISION="-Dsonar.scm.revision=${SCM_REVISION}" \
    LINK_HOMEPAGE="-Dsonar.links.homepage=${LINK_HOMEPAGE}" \
    LINK_CI="-Dsonar.links.ci=${LINK_CI}" \
    LINK_ISSUE="-Dsonar.links.issue=${LINK_ISSUE}" \
    LINK_SCM="-Dsonar.links.scm=${LINK_SCM}" \
    PROJECT_KEY="-Dsonar.projectKey=${PROJECT_KEY}" \
    PROJECT_NAME="-Dsonar.projectName=${PROJECT_NAME}" \
    PROJECT_VERSION="-Dsonar.projectVersion=${PROJECT_VERSION}" \
    PROJECT_DESCRIPTION="-Dsonar.projectDescription=${PROJECT_DESCRIPTION}"
ENV SONARQUBE_PROPERTIES="${SONARQUBE_URL} ${SONARQUBE_TOKEN} ${WORKING_DIRECTORY} ${SOURCE_ENCODING} \
    ${SOURCE_DIRECTORY} ${SCM_PROVIDER} ${SCM_FORCE_RELOAD} ${SCM_REVISION} ${LINK_HOMEPAGE} ${LINK_CI} ${LINK_ISSUE} \
    ${LINK_SCM} ${PROJECT_KEY} ${PROJECT_NAME} ${PROJECT_VERSION} ${PROJECT_DESCRIPTION}"

FROM prepare-sonar-scanner-environment AS run-sonar-scanner
RUN --mount=type=bind,source=.git,target=.git \
    --mount=type=bind,source=src,target=src \
    --mount=type=cache,target=/root/.sonar,id=sonar_cache,sharing=locked \
    --mount=type=cache,target=/tmp/scannerwork,id=sonar_tmp,sharing=locked \
    --mount=type=bind,source=/sonar-scanner,target=sonar-scanner,from=sonar-scanner \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-dependencies \
    ./sonar-scanner/bin/sonar-scanner ${SONARQUBE_PROPERTIES}

FROM prepare-build-environment AS prepare-virtual-host
ARG VIRTUAL_HOST
ENV VIRTUAL_HOST="$VIRTUAL_HOST"

FROM prepare-build-environment AS prepare-firebase-credentials
ARG FIREBASE_KEY
ENV FIREBASE_TOKEN="$FIREBASE_KEY"

FROM prepare-virtual-host AS lint-source-code
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=public,target=public \
    --mount=type=bind,source=.gitignore,target=.gitignore \
    --mount=type=bind,source=.eslintrc.yml,target=.eslintrc.yml \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-dependencies \
    npm run lint

FROM prepare-virtual-host AS build-source-code
ARG REACT_APP_WALLET_CONNECT
ARG REACT_APP_FORTMATIC
ARG REACT_APP_PORTIS
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=public,target=public \
    --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-dependencies \
    npm run build

FROM prepare-firebase-credentials AS deploy-firebase-application
RUN --mount=type=bind,source=.firebaserc,target=.firebaserc \
    --mount=type=bind,source=firebase.json,target=firebase.json \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=/opt/app/build,target=build,from=build-source-code \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-dependencies \
    --mount=type=bind,source=src,target=src \
    npm run deploy_hosting

FROM prepare-virtual-host AS export-reports
COPY --from=list-npm-settings /opt/app/npm.json /tmp/
COPY --from=audit-dependencies /opt/app/audit.html /tmp/dependencies.audit.html
COPY --from=check-licenses /opt/app/licenses.json /tmp/

FROM prepare-virtual-host AS firebase-application
RUN --mount=target=.,from=audit-dependencies \
    --mount=target=.,from=lint-source-code \
    --mount=target=.,from=deploy-firebase-application

LABEL org.opencontainers.image.description="zksync.matter" \
      org.opencontainers.image.is-production="true" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.component="firebase" \
      org.opencontainers.image.repository="zksync.matter" \
      org.opencontainers.image.project="naw" \
      org.opencontainers.image.namespace="naw" \
      org.opencontainers.image.registry="hotline.nodeart.app" \
      org.opencontainers.image.vendor="NodeArt" \
      org.opencontainers.image.documentation="https://git.nodeart.app/scm/naw/zksync.matter.git" \
      org.opencontainers.image.source="https://git.nodeart.app/scm/naw/zksync.matter.git" \
      org.opencontainers.image.url="https://git.nodeart.app/scm/naw/zksync.matter.git" \
      org.opencontainers.image.title="zksync.matter" \
      org.opencontainers.image.licenses=""
