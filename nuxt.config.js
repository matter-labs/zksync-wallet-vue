require("dotenv").config();

const isProduction = process.env.APP_CURRENT_NETWORK === "mainnet";
const pageTitle = `zkWallet — the access to L2 zkSync features on mainnet. | ${process.env.APP_CURRENT_NETWORK.toString()
  .charAt(0)
  .toUpperCase()}${process.env.APP_CURRENT_NETWORK.slice(1)}`;
const pageDescription = `A crypto wallet & gateway to layer-2 zkSync Rollup. zkSync is a trustless, secure, user-centric protocol for scaling payments and smart contracts on Ethereum`;
const pageKeywords = `zkSync, Matter Labs, rollup, ZK rollup, zero confirmation, ZKP, zero-knowledge proofs, Ethereum, crypto, blockchain, permissionless, L2, secure payments, scalable
crypto payments, zkWallet, cryptowallet`;

export default {
  ssr: false,
  target: "static",
  srcDir: "src/",
  vue: {
    config: {
      productionTip: isProduction,
      devtools: !isProduction,
    },
  },
  env: {
    ...process.env,
  },

  /*
   ** Headers of the page
   */
  head: {
    name: pageTitle,
    titleTemplate: pageTitle,
    meta: [
      { "http-equiv": "pragma", content: "no-cache" },
      { "http-equiv": "cache-control", content: "no-cache , no-store, must-revalidate" },
      { "http-equiv": "expires", content: "0" },
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: pageDescription,
      },
      {
        hid: "keywords",
        name: "keywords",
        content: pageKeywords,
      },
      {
        hid: "author",
        name: "author",
        content: "https://zksync.io",
      },
      {
        hid: "msapplication-TileImage",
        name: "msapplication-TileImage",
        content: "/icon.png",
      },
      { hid: "theme-color", name: "theme-color", content: "#4e529a" },
      {
        hid: "msapplication-TileColor",
        property: "msapplication-TileColor",
        content: "#4e529a",
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: "#8c8dfc",
    continuous: true,
  },
  /*
   ** Global CSS
   */
  css: ["@/assets/style/main.scss"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ["@/plugins/main.js"],

  router: {
    middleware: ["wallet"],
  },
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [["@nuxtjs/dotenv", { path: __dirname }]],

  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/dotenv",
    "@nuxtjs/pwa",
    "@nuxtjs/axios",
    "@nuxtjs/toast",
    "@nuxtjs/google-gtag",
    "@inkline/nuxt",
    "@nuxtjs/style-resources",
    "nuxt-webfontloader",
    [
      "nuxt-i18n",
      {
        locales: [
          {
            code: "en",
            iso: "en_US",
            file: "en/translations.json",
          },
        ],
        defaultLocale: "en",
        langDir: "./locales/",
      },
    ],
    [
      "nuxt-social-meta",
      {
        url: "https://wallet.zksync.io",
        title: pageTitle,
        site_name: pageTitle,
        description: pageDescription,
        img: "https://wallet.zksync.io/zkwallet.jpg",
        locale: "en_US",
        twitter: "@zksync",
        twitter_card: "https://wallet.zksync.io/zkwallet.jpg",
        themeColor: "#4e529a",
      },
    ],
    "@nuxtjs/sentry",
  ],
  webfontloader: {
    google: {
      families: ["Fira+Sans:400,600", "Fira+Sans+Extra+Condensed:400,600", "Fira+Code:400"],
    },
  },
  toast: {
    singleton: true,
    keepOnHover: true,
    position: "bottom-right",
    duration: 4000,
    iconPack: "fontawesome",
  },
  i18n: {
    vueI18n: {
      fallbackLocale: "en",
      messages: {
        en: require("./src/locales/en/translations.json"),
      },
    },
  },
  inkline: {
    config: {
      autodetectVariant: true,
    },
  },
  styleResources: {
    scss: "@/assets/style/_variables.scss",
  },
  sentry: {
    dsn: "https://de3e0dcf0e9c4243b6bd7cfbc34f6ea1@o496053.ingest.sentry.io/5569800",
    config: {
      tracesSampleRate: 1.0,
    },
  },
  "google-gtag": {
    id: "UA-178057628-1",
    config: {
      anonymize_ip: true, // anonymize IP
      send_page_view: true, // might be necessary to avoid duplicated page track on page reload
    },
    debug: false, // enable to track in dev mode
    disableAutoPageTrack: false, // disable if you don't want to track each page route with router.afterEach(...).
  },
  /*
   ** Build configuration
   */
  build: {
    ssr: false,
    // target: "static",
    /* extractCSS: {
      ignoreOrder: true,
    }, */
    extend(config) {
      config.node = {
        fs: "empty",
      };
    },
  },
  generate: {
    dir: "public",
    fallback: "404.html",
  },
  pwa: {
    workbox: {
      pagesURLPattern: "/_nuxt/",
    },
  },
};
