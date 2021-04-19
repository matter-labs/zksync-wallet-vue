import { NuxtConfig } from "@nuxt/types";
import { ToastAction, ToastIconPack, ToastObject, ToastOptions, ToastPosition } from "vue-toasted";

const env = process.env.APP_ENV ?? "dev";
const isProduction = process.env.APP_CURRENT_NETWORK === "mainnet" && env === "prod";
const srcDir = "src";
const pageTitle = "zkWallet — your access to L2 zkSync Rollup features.";
const pageImg = "/Cover.jpg";

const pageTitleTemplate = `zkWallet on ${process.env.APP_CURRENT_NETWORK?.toString().charAt(0).toUpperCase()}${process.env.APP_CURRENT_NETWORK?.slice(1)}`;
const pageDescription =
  "A crypto wallet & gateway to layer-2 zkSync Rollup. zkSync is a trustless, secure, user-centric protocol for scaling payments and smart contracts on Ethereum";
const pageKeywords = `zkSync, Matter Labs, rollup, ZK rollup, zero confirmation, ZKP, zero-knowledge proofs, Ethereum, crypto, blockchain, permissionless, L2, secure payments, scalable
crypto payments, zkWallet, cryptowallet`;

const config: NuxtConfig = {
  components: true,
  ssr: false,
  target: "static",
  srcDir: `${srcDir}/`,
  vue: {
    config: {
      productionTip: isProduction,
      devtools: !isProduction,
    },
  },
  // @ts-ignore
  env: {
    ...process.env,
  },

  /*
   ** Headers of the page
   */
  head: {
    title: pageTitle as string | undefined,
    titleTemplate: `%s | ${pageTitleTemplate}`,
    htmlAttrs: {
      lang: "en",
      // @ts-ignore
      amp: true,
    },
    meta: [
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
        content: pageImg,
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
        content: pageImg,
      },
      {
        hid: "og:title",
        property: "og:title",
        content: pageTitleTemplate,
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
        content: pageTitleTemplate,
      },

      { "http-equiv": "pragma", content: "no-cache", property: "pragma" },
      { "http-equiv": "cache-control", property: "cache-control", content: "no-cache , no-store, must-revalidate" },
      { "http-equiv": "expires", content: "0", property: "expires" },
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
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
  plugins: ["@/plugins/main"],

  router: {
    middleware: ["wallet"],
  },
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxtjs/style-resources", "@nuxt/typescript-build", "nuxt-typed-vuex", ["@nuxtjs/dotenv", { path: __dirname }]],

  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/dotenv",
    "@nuxtjs/axios",
    "@nuxtjs/toast",
    "@nuxtjs/google-gtag",
    "@inkline/nuxt",
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
    "@nuxtjs/sentry",
  ],
  webfontloader: {
    google: {
      families: ["Fira+Sans:400,600", "Fira+Sans+Extra+Condensed:400,600", "Fira+Code:400"],
    },
  },
  toast: <ToastOptions>{
    singleton: true,
    keepOnHover: true,
    position: "bottom-right" as ToastPosition,
    duration: 4000,
    className: "zkToastMain",
    iconPack: "fontawesome" as ToastIconPack,
    action: <ToastAction>{
      text: "Close",
      class: "zkToastActionClose",
      icon: "fa-times-circle",
      onClick: (_e: Event, toastObject: ToastObject): void => {
        toastObject.goAway(100);
      },
    },
  },
  i18n: {
    vueI18n: {
      fallbackLocale: "en",
      messages: {
        en: require(`./${srcDir}/locales/en/translations.json`),
      },
    },
  },
  inkline: {
    config: {
      variant: "dark",
      autodetectVariant: true,
    },
  },
  styleResources: {
    scss: ["@/assets/style/vars/*.scss"],
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    disableServerSide: true,
    config: {
      environment: env === "prod" ? "production" : env === "dev" ? "development" : env,
      tracesSampleRate: 1.0,
    },
  },
  "google-gtag": {
    id: process.env.GTAG_ID,
    config: {
      anonymize_ip: true, // anonymize IP
      send_page_view: true, // might be necessary to avoid duplicated page track on page reload
    },
    debug: env !== "prod", // enable to track in dev mode
    disableAutoPageTrack: false, // disable if you don't want to track each page route with router.afterEach(...).
  },
  /*
   ** Build configuration
   */
  build: {
    ssr: false,
    extend() {
      config.node = {
        fs: "empty",
      };
    },
  },
  generate: {
    dir: "public",
  },
  typescript: {
    typeCheck: {
      eslint: {
        files: `${srcDir}/**/*.{ts,js,vue}`,
      },
    },
  },
};
export default config;
