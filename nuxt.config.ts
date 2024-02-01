import { NuxtConfig } from "@nuxt/types";
import { NuxtOptionsBuild } from "@nuxt/types/config/build";
import { NuxtOptionsEnv } from "@nuxt/types/config/env";
import { version as zkSyncVersion } from "zksync/package.json";

import { ModuleOptions } from "@matterlabs/zksync-nuxt-core/types";
import { Configuration } from "webpack";
// @ts-ignore
import packageData from "./package.json";

const gitVersion = packageData.version;

const appEnv: string = process.env.APP_ENV ?? "dev";
const isLocalhost: boolean = !!process.env.IS_LOCALHOST;
const isDebugEnabled: boolean = appEnv === "dev";
const isProduction: boolean = appEnv === "prod";

const gitRevision =
  `${process.env.APP_GIT_REVISION}`.length > 8
    ? `${process.env.APP_GIT_REVISION}`.slice(0, 7)
    : `${process.env.APP_GIT_REVISION}`;

const meta = {
  title: "zkSync Wallet",
  titleTemplate: "%s | zkSync: secure, scalable crypto payments",
  description:
    "A crypto wallet & gateway to layer-2 zkSync Rollup. zkSync is a trustless, secure, user-centric protocol for scaling payments and smart contracts on Ethereum",
  keywords:
    "zkSync, Matter Labs, rollup, ZK rollup, zero confirmation, ZKP, zero-knowledge proofs, Ethereum, crypto, blockchain, permissionless, L2, secure payments, scalable crypto payments, zkWallet, cryptowallet",
  image: "/social.png",
};

const functionsBaseUrl = process.env.FIREBASE_FUNCTIONS_BASE_URL || "http://localhost:5001/zksync-vue/us-central1/";

const config = <NuxtConfig>{
  components: ["@/components/", { path: "@/blocks/", prefix: "block" }],
  telemetry: false,
  ssr: false,
  target: "static",
  srcDir: "./src/",
  vue: {
    config: {
      productionTip: isProduction,
      devtools: !isProduction,
    },
  },
  env: {
    ...process.env,
  } as NuxtOptionsEnv,

  publicRuntimeConfig: {
    mixpanel: {
      isProduction,
      token: `${process.env.MIXPANEL_TOKEN}`,
    },
    git: {
      version: gitVersion,
      revision: gitRevision,
    },
    zksyncVersion: zkSyncVersion,
  },

  head: {
    title: meta.title,
    titleTemplate: meta.titleTemplate,
    htmlAttrs: {
      lang: "en",
      amp: "true",
    },
    meta: [
      {
        httpEquiv: "cache-control",
        property: "cache-control",
        content: "no-cache , no-store, must-revalidate",
      },
      {
        httpEquiv: "expires",
        content: "0",
        property: "expires",
      },
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0" },

      /**
       * Page meta:
       * - SEO tags (keywords, description, author)
       * - OpenGraph tags (thumbnail,
       **/
      {
        hid: "keywords",
        name: "keywords",
        content: meta.keywords,
      },
      {
        hid: "description",
        name: "description",
        content: meta.description,
      },
      {
        hid: "author",
        name: "author",
        content: "https://matter-labs.io",
      },
      {
        hid: "twitter:title",
        name: "twitter:title",
        content: meta.title,
      },
      {
        hid: "twitter:description",
        name: "twitter:description",
        content: meta.description,
      },
      {
        hid: "twitter:image",
        name: "twitter:image",
        content: meta.image,
      },
      {
        hid: "twitter:site",
        name: "twitter:site",
        content: "@zksync",
      },
      {
        hid: "twitter:creator",
        name: "twitter:creator",
        content: "@the_matter_labs",
      },
      {
        hid: "twitter:image:alt",
        name: "twitter:image:alt",
        content: meta.title,
      },
      {
        hid: "og:title",
        property: "og:title",
        content: meta.title,
      },
      {
        hid: "og:description",
        property: "og:description",
        content: meta.description,
      },
      {
        hid: "og:image",
        property: "og:image",
        content: meta.image,
      },
      {
        hid: "og:image:secure_url",
        property: "og:image:secure_url",
        content: meta.image,
      },
      {
        hid: "og:image:alt",
        property: "og:image:alt",
        content: meta.title,
      },
      {
        hid: "msapplication-TileImage",
        name: "msapplication-TileImage",
        content: "/favicon.png",
      },
      { hid: "theme-color", name: "theme-color", content: "#4e529a" },
      {
        hid: "msapplication-TileColor",
        property: "msapplication-TileColor",
        content: "#4e529a",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
  },

  // Customize the progress-bar color
  loading: {
    color: "#8c8dfc",
    continuous: true,
  },

  // Single-entry global-scope scss
  css: ["@/assets/style/main.scss"],

  // Plugins that should be loaded before the mounting
  plugins: [
    "@/plugins/icons",
    "@/plugins/routerMixin",
    "@/plugins/filters",
    "@/plugins/restoreSession",
    { src: "@/plugins/analytics", mode: "client" },
  ],

  styleResources: {
    scss: ["@/assets/style/vars/*.scss"],
  },

  router: {
    middleware: ["auth"],
  },

  // Nuxt.js dev-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    "@nuxtjs/style-resources",
    "@nuxtjs/google-fonts",
    "nuxt-typed-vuex",
    [
      "@matterlabs/zksync-nuxt-core",
      <ModuleOptions>{
        ipfsGateway: "https://ipfs.io",
        network: process.env.ZK_NETWORK,
        apiKeys: {
          FORTMATIC_KEY: process.env.APP_FORTMATIC,
          PORTIS_KEY: process.env.APP_PORTIS,
          INFURA_KEY: "560464419d33486ab1713d61ac9f1d82",
        },
        onboardConfig: {
          APP_NAME: meta.title,
          APP_ID: "764666de-bcb7-48a6-91fc-75e9dc086ea0",
        },
        disabledWallets: [
          {
            name: "Keystone",
            error: `Wallet Keystone is not supported`,
          },
        ],
        restoreNetwork: true,
        logoutRedirect: "/",
        screeningApiUrl: process.env.SCREENING_API_URL,
      },
    ],
  ],

  // Nuxt.js modules
  modules: ["@inkline/nuxt", "@nuxtjs/sentry", "@nuxtjs/proxy", "@nuxtjs/google-gtag"],
  inkline: {
    config: {
      autodetectVariant: true,
    },
  },
  sentry: {
    dsn: "https://de3e0dcf0e9c4243b6bd7cfbc34f6ea1@o496053.ingest.sentry.io/5569800",
    disableServerSide: true,
    disabled: isLocalhost,
    config: {
      tunnel: "/tunnel/sentry",
      debug: isDebugEnabled,
      tracesSampleRate: 1.0,
      environment: isProduction ? "production" : appEnv === "dev" ? "development" : appEnv,
    },
  },
  proxy: isLocalhost
    ? {
        "/api/moonpaySign": `${functionsBaseUrl}moonpaySign`,
        "/tunnel/mixpanel": `${functionsBaseUrl}mixpanelTunnel`,
        "/tunnel/sentry": `${functionsBaseUrl}sentryTunnel`,
      }
    : {},
  "google-gtag": {
    id: "GTM-ML2QDNV",
    config: {
      anonymize_ip: true, // anonymize IP
      send_page_view: false, // might be necessary to avoid duplicated page track on page reload
      linker: {
        domains: ["wallet.zksync.io"],
      },
    },
    debug: isDebugEnabled, // enable to track in dev mode
    disableAutoPageTrack: false, // disable if you don't want to track each page route with router.afterEach(...).
  },
  render: {
    injectScripts: true,
    ssr: false,
    crossorigin: "anonymous",
    resourceHints: false,
    static: {
      immutable: true,
      maxAge: "1d",
      prefix: true,
    },
    dist: {
      lastModified: true,
      immutable: true,
      // Serve index.html template
      index: true,
      maxAge: "1m",
    },
  },

  // Build configuration
  build: <NuxtOptionsBuild>{
    filenames: { chunk: () => `[name]_Y2ZjItY_${isProduction ? "[contenthash]" : ""}.js` },
    cache: isProduction,
    cssSourceMap: !isProduction,
    hardSource: isProduction,
    parallel: isProduction,
    babel: {
      compact: true,
      plugins: ["@babel/plugin-proposal-optional-chaining", "@babel/plugin-proposal-nullish-coalescing-operator"],
    },
    postcss: {
      plugins: {
        autoprefixer: {},
      },
    },
    corejs: 3,
    ssr: false,
    extractCSS: {
      ignoreOrder: true,
    },
    optimization: {
      removeAvailableModules: true,
      flagIncludedChunks: true,
      mergeDuplicateChunks: true,
      splitChunks: {
        chunks: "async",
        maxSize: 200000,
      },
      minimize: isProduction,
    },
    transpile: ["oh-vue-icons", "@inkline/inkline", "iconsPlugin", "filtersPlugin", "restoreSessionPlugin"],
    extend: (config: Configuration) => {
      config.module!.rules.push({
        test: /\.m?js$/,
        include: [
          /node_modules[\\/]superstruct/,
          /node_modules[\\/]@walletconnect/,
          /node_modules[\\/]@web3modal[\\/]core/,
          /node_modules[\\/]@web3modal[\\/]ui/,
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-proposal-optional-chaining", "@babel/plugin-proposal-nullish-coalescing-operator"],
          },
        },
      });

      config.node = {
        fs: "empty",
      };
      if (!config.output) {
        config.output = {
          crossOriginLoading: isProduction ? "anonymous" : false,
        };
      } else {
        config.output.crossOriginLoading = isProduction ? "anonymous" : false;
      }
    },
  },
  googleFonts: {
    overwriting: true,
    prefetch: true,
    preconnect: true,
    preload: true,
    display: "swap",
    families: {
      "Fira+Sans": [400, 600],
      "Fira+Code": [400],
    },
  },
  generate: {
    dir: "public",
    cache: false,
    devtools: !isProduction,
  },
};
export default config;
