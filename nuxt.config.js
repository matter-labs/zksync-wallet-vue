require("dotenv").config();

export default {
  ssr: false,
  target: "static",
  srcDir: "src/",

  env: {
    ...process.env,
  },

  /*
   ** Headers of the page
   */
  head: {
    name: (process.env.APP_NAME ? process.env.APP_NAME : "zkWallet v.2.0-beta") + (process.env.APP_CURRENT_NETWORK ? ` | ETHER: ${process.env.APP_CURRENT_NETWORK}` : ""),
    titleTemplate: (process.env.APP_NAME ? process.env.APP_NAME : "zkWallet v.2.0-beta") + (process.env.APP_CURRENT_NETWORK ? ` | ETHER: ${process.env.APP_CURRENT_NETWORK}` : ""),
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
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
  //loadingIndicator: '@/components/loading.vue',
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
  buildModules: [],

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
  pwa: {
    icon: {
      fileName: "icon.png",
    },
    manifest: {
      name: (process.env.APP_NAME ? process.env.APP_NAME : "zkWallet v.2.0-beta") + (process.env.APP_CURRENT_NETWORK ? ` | ETHER: ${process.env.APP_CURRENT_NETWORK}` : ""),
      short_name: "zkWallet DAPP",
      description: "zkWallet was created to unleash the power of zkSync L2 operations and give everyone the access to L2 zkSync features on mainnet.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#11142b",
      theme_color: "#4e529a",
    },
  },
  toast: {
    position: "bottom-right",
    duration: 2000,
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
    scss: "./assets/style/_variables.scss",
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
    target: "static",
    extractCSS: {
      ignoreOrder: true,
    },
    extend(config, { isDev, isClient }) {
      config.node = {
        fs: "empty",
      };
    },
  },
  generate: {
    dir: "public",
    fallback: "404.html",
  },
};
