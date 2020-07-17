# syntax = docker/dockerfile:1.1.7-experimental

FROM registry-1.docker.io/library/node:14.5.0-stretch-slim AS declare-node-stage

FROM declare-node-stage AS create-working-directory
ENV WORKDIR='/opt/app'
WORKDIR ${WORKDIR}

FROM create-working-directory AS enable-package-caching
ENV DEBIAN_FRONTEND='noninteractive'
RUN rm -f /etc/apt/apt.conf.d/docker-clean; \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

FROM enable-package-caching AS prepare-node-environment
ENV NODE_OPTIONS='--max_old_space_size=6144'

FROM prepare-node-environment AS install-system-dependencies
ENV BASIC_DEPS='ca-certificates apt-transport-https curl' \
    BUILD_DEPS='build-essential g++ python make git gnupg' \
    CWEBP_DEPS='libglu1 libxi6 libjpeg62 libpng16-16'
ENV DEPS="${BASIC_DEPS} ${BUILD_DEPS} ${CWEBP_DEPS}"
RUN --mount=type=cache,target=/var/cache/apt,id=apt-cache_cache,sharing=locked \
    --mount=type=cache,target=/var/cache/debconf,id=debconf-cache_cache,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,id=apt-lib_cache,sharing=locked \
    apt -y update && apt -y install --no-install-recommends ${DEPS}

FROM install-system-dependencies AS install-latest-npm
RUN --mount=type=cache,target=/root/.npm,id=npm_cache,sharing=locked \
    --mount=type=cache,target=/tmp,id=npm_releases,sharing=locked \
    npm --prefer-offline install npm --global --silent

FROM install-latest-npm AS list-npm-settings
ARG INVALIDATE_CACHE
RUN npm config list --json > npm.json

FROM install-latest-npm AS install-project-dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,id=npm_cache,sharing=locked \
    --mount=type=cache,target=/tmp,id=npm_releases,sharing=locked \
    npm --prefer-offline ci --silent

FROM install-latest-npm AS check-licenses
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    npm run check_licenses

FROM install-latest-npm AS audit-node-dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    npm run audit_dependencies

FROM install-latest-npm AS lint-source-code-ts
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=.eslintrc.yml,target=.eslintrc.yml \
    --mount=type=bind,source=.eslintignore,target=.eslintignore \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    npm run lint-ts

FROM install-latest-npm AS lint-source-code-css
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    npm run lint-css

FROM install-latest-npm AS prepare-build-environment
ARG FIREBASE_PROJECT
ENV NODE_ENV='production'

FROM prepare-build-environment AS build-frontend-bundle
RUN --mount=type=bind,source=environments,target=environments \
    cp environments/.env.${FIREBASE_PROJECT} .env
RUN --mount=type=cache,target=./.gzip_cache,id=webpack-compression-gzip_cache,sharing=locked \
    --mount=type=cache,target=./.brotli_cache,id=brotli-compression-gzip_cache,sharing=locked \
    --mount=type=cache,target=./.assets_cache,id=imagemin-assets_cache,sharing=locked \
    --mount=type=bind,source=.git,target=.git \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=public,target=public \
    --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=bind,source=webpack.config.js,target=webpack.config.js \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    npm run build

FROM prepare-build-environment AS prepare-firebase-credentials
ARG FIREBASE_TOKEN

FROM prepare-firebase-credentials AS deploy-firebase-application
RUN --mount=type=bind,source=.firebaserc,target=.firebaserc \
    --mount=type=bind,source=firebase.json,target=firebase.json \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=/opt/app/build,target=build,from=build-frontend-bundle \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    npm run deploy_hosting

FROM scratch AS export-frontend-bundle
COPY --from=build-frontend-bundle /opt/app/build ./

FROM scratch AS firebase-application
COPY --from=audit-node-dependencies /opt/app/audit.html ./
COPY --from=list-npm-settings /opt/app/npm.json ./
COPY --from=check-licenses /opt/app/licenses.json ./
COPY --from=lint-source-code-ts /tmp /tmp
COPY --from=lint-source-code-css /tmp /tmp
COPY --from=deploy-firebase-application /tmp /tmp

LABEL org.opencontainers.image.description="zksync.matter" \
      org.opencontainers.image.is-production="true" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.component="firebase" \
      org.opencontainers.image.repository="zksync.matter" \
      org.opencontainers.image.project="zksync" \
      org.opencontainers.image.namespace="zksync" \
      org.opencontainers.image.registry="zksync" \
      org.opencontainers.image.vendor="zksync" \
      org.opencontainers.image.documentation="https://github.com/matter-labs/zksync-wallet-dev.git" \
      org.opencontainers.image.source="https://github.com/matter-labs/zksync-wallet-dev.git" \
      org.opencontainers.image.url="https://github.com/matter-labs/zksync-wallet-dev.git" \
      org.opencontainers.image.title="zksync.matter" \
      org.opencontainers.image.licenses=""
