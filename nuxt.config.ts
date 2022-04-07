import { NuxtConfig } from "@nuxt/types";
import { NuxtOptionsBuild } from "@nuxt/types/config/build";
import { NuxtOptionsEnv } from "@nuxt/types/config/env";
import { version as zkSyncVersion } from "zksync/package.json";

import { ModuleOptions } from "@matterlabs/zksync-nuxt-core/types";
import { Configuration, DefinePlugin } from "webpack";

const appEnv: string = process.env.APP_ENV ?? "dev";
const isLocalhost: boolean = process.env.IS_LOCALHOST !== undefined;
const isDebugEnabled: boolean = appEnv === "dev";
const isProduction: boolean = appEnv === "prod";
const pageTitle = "zkSync Wallet";
const pageImg = "/screenshot.jpg";

const sentryDsn = "https://de3e0dcf0e9c4243b6bd7cfbc34f6ea1@o496053.ingest.sentry.io/5569800";
const gtagId = "GTM-ML2QDNV";

const gitRevision =
  `${process.env.APP_GIT_REVISION}`.length > 8
    ? `${process.env.APP_GIT_REVISION}`.slice(0, 7)
    : `${process.env.APP_GIT_REVISION}`;

const pageTitleTemplate = "%s | zkSync: secure, scalable crypto payments";
const pageDescription =
  "A crypto wallet & gateway to layer-2 zkSync Rollup. zkSync is a trustless, secure, user-centric protocol for scaling payments and smart contracts on Ethereum";
const pageKeywords = `zkSync, Matter Labs, rollup, ZK rollup, zero confirmation, ZKP, zero-knowledge proofs, Ethereum, crypto, blockchain, permissionless, L2, secure payments, scalable
crypto payments, zkWallet, cryptowallet`;

/**
 * Cloud-functions mapping
 *
 * @uses @nuxtjs/proxy
 * @type {string}
 */
const functionsBaseUrl = process.env.FIREBASE_FUNCTIONS_BASE_URL || "http://localhost:5001/zksync-vue/us-central1/";
const localhostProxy = isLocalhost
  ? {
      "/api/moonpaySign": `${functionsBaseUrl}moonpaySign`,
      "/api/banxaAuth": `${functionsBaseUrl}banxaAuth`,
      "/tunnel/mixpanel": `${functionsBaseUrl}mixpanelTunnel`,
      "/tunnel/sentry": `${functionsBaseUrl}sentryTunnel`,
    }
  : {};

const config = {
  components: ["@/components/", { path: "@/blocks/", prefix: "block" }],
  telemetry: false,
  ssr: false,
  target: "static",
  static: true,
  srcDir: "./src/",
  vue: {
    config: {
      productionTip: isProduction,
      devtools: !isProduction,
    },
  },
  env: <NuxtOptionsEnv>{
    ...process.env,
  },
  publicRuntimeConfig: {
    mixpanel: {
      isProduction: isProduction as boolean,
      token: `${process.env.MIXPANEL_TOKEN}`,
    },
    git: {
      version: `${process.env.APP_GIT_VERSION}`,
      revision: gitRevision as string,
    },
    zksyncVersion: zkSyncVersion,
    rampConfig: {
      mainnet: {
        url: undefined, // default
        hostApiKey: process.env.RAMP_MAINNET_HOST_API_KEY,
      },
      // rinkeby: {
      //  url: "https://ri-widget-staging.firebaseapp.com/",
      //  hostApiKey: process.env.RAMP_RINKEBY_HOST_API_KEY,
      // },
      // ropsten: {
      //   url: "https://ri-widget-staging-ropsten.firebaseapp.com/",
      //   hostApiKey: process.env.RAMP_ROPSTEN_HOST_API_KEY,
      // },
    },
    utorgConfig: {
      mainnet: {
        url: "https://app.utorg.pro",
        sid: process.env.UTORG_MAINNET_SID,
      },
      rinkeby: {
        url: "https://app-stage.utorg.pro",
        sid: process.env.UTORG_RINKEBY_SID,
      },
      ropsten: {
        url: "https://app-stage.utorg.pro",
        sid: process.env.UTORG_ROPSTEN_SID,
      },
    },
    banxaConfig: {
      mainnet: {
        url: "https://zksync.banxa.com",
      },
      // rinkeby: {
      //   url: "https://zksync.banxa-sandbox.com",
      // },
      // ropsten: {
      //   url: "https://zksync.banxa-sandbox.com",
      // },
    },
    moonpayConfig: {
      mainnet: {
        url: "https://buy.moonpay.com",
        apiPublicKey: process.env.MOONPAY_MAINNET_API_PUBLIC_KEY,
      },
      rinkeby: {
        url: "https://buy-sandbox.moonpay.com",
        apiPublicKey: process.env.MOONPAY_RINKEBY_API_PUBLIC_KEY,
      },
      // ropsten: {
      //   url: "https://buy-staging.moonpay.com",
      //   apiPublicKey: process.env.MOONPAY_API_PUBLIC_KEY,
      // },
    },
  },

  /**
   * Head-placed HTML-tags / configuration of the `<meta>`
   **/
  head: {
    title: pageTitle as string | undefined,
    titleTemplate: pageTitleTemplate,
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
      /**
       * UX / UI settings
       **/
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
        content: pageKeywords,
      },
      {
        hid: "description",
        name: "description",
        content: pageDescription,
      },
      {
        hid: "author",
        name: "author",
        content: "https://matter-labs.io",
      },
      {
        hid: "twitter:title",
        name: "twitter:title",
        content: pageTitle,
      },
      {
        hid: "twitter:description",
        name: "twitter:description",
        content: pageDescription,
      },
      {
        hid: "twitter:image",
        name: "twitter:image",
        content: pageImg,
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
        content: pageTitle,
      },
      {
        hid: "og:title",
        property: "og:title",
        content: pageTitle,
      },
      {
        hid: "og:description",
        property: "og:description",
        content: pageDescription,
      },
      {
        hid: "og:image",
        property: "og:image",
        content: pageImg,
      },
      {
        hid: "og:image:secure_url",
        property: "og:image:secure_url",
        content: pageImg,
      },
      {
        hid: "og:image:alt",
        property: "og:image:alt",
        content: pageTitle,
      },
      {
        hid: "msapplication-TileImage",
        name: "msapplication-TileImage",
        content: "/favicon-dark.png",
      },
      { hid: "theme-color", name: "theme-color", content: "#4e529a" },
      {
        hid: "msapplication-TileColor",
        property: "msapplication-TileColor",
        content: "#4e529a",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon-dark.png" }],
  },
  /**
   * Customize the progress-bar color
   **/ loading: {
    color: "#8c8dfc",
    continuous: true,
  },

  /**
   * Single-entry global-scope scss
   **/
  css: ["@/assets/style/main.scss"],
  /**
   * Plugins that should be loaded before the mounting
   **/
  plugins: [
    "@/plugins/icons",
    "@/plugins/filters",
    "@/plugins/restoreSession",
    { src: "@/plugins/analytics", mode: "client" },
  ],

  styleResources: {
    scss: ["@/assets/style/vars/_variables.scss"],
  },

  router: {
    middleware: ["auth"],
  },
  /**
   * Nuxt.js dev-modules
   **/ buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build", // https://go.nuxtjs.dev/stylelint
    "@nuxtjs/style-resources",
    "@nuxtjs/google-fonts",
    "nuxt-typed-vuex",
    [
      "@matterlabs/zksync-nuxt-core",
      {
        ipfsGateway: "https://ipfs.io",
        network: process.env.ZK_NETWORK,
        apiKeys: {
          FORTMATIC_KEY: process.env.APP_FORTMATIC,
          PORTIS_KEY: process.env.APP_PORTIS,
          /**
           * Added for all environments to reduce complexity
           **/
          INFURA_KEY: "c3f5636451af461fafaee653cbd9ef2a",
        },
        onboardConfig: {
          APP_NAME: pageTitle,
          /**
           * Added for all environments to reduce complexity
           **/ APP_ID: "764666de-bcb7-48a6-91fc-75e9dc086ea0",
        },
        restoreNetwork: true,
        logoutRedirect: "/",
      } as ModuleOptions,
    ],
  ],

  /**
   * Nuxt.js modules
   **/
  modules: ["@inkline/nuxt", "@nuxtjs/sentry", "@nuxtjs/proxy", "@nuxtjs/google-gtag"],

  /**
   * @deprecated Starting from the v.3.0.0 ```inkline/nuxt``` support will be dropped in favour to ```@tailwindcss`` / ```@tailwindUI```
   **/
  inkline: {
    config: {
      autodetectVariant: true,
    },
  },
  sentry: {
    dsn: sentryDsn,
    disableServerSide: true,
    disabled: isLocalhost,
    config: {
      tunnel: "/tunnel/sentry",
      debug: isDebugEnabled,
      tracesSampleRate: 1.0,
      environment: isProduction ? "production" : appEnv === "dev" ? "development" : appEnv,
    },
  },
  proxy: {
    ...localhostProxy,
  },
  "google-gtag": {
    id: gtagId,
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
      // 1 year in production
      maxAge: "1m",
    },
  },

  /**
   * Build configuration
   **/
  build: {
    transpile: ["oh-vue-icons", "@inkline/inkline", "iconsPlugin", "filtersPlugin", "restoreSessionPlugin"],
    extend: (config: Configuration) => {
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
  } as NuxtOptionsBuild,
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
} as NuxtConfig;
export default config;
