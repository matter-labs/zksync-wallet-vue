require("dotenv").config();

export default {
  ssr: false,
  srcDir: 'src',
  buildDir: 'functions/.nuxt',

  env: {
    ...process.env,
  },

  /*
   ** Headers of the page
   */
  head: {
    title: `${process.env.APP_NAME ? process.env.APP_NAME : "zkWallet v.2.0-beta"} | ${process.env.APP_CURRENT_NETWORK ? `${process.env.APP_CURRENT_NETWORK} | ` : ""}`,
    titleTemplate: "%s - " + process.env.APP_NAME,
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
    "@nuxtjs/axios",
    "@nuxtjs/toast",
    "@nuxtjs/dotenv",
    "@nuxtjs/style-resources",
    "@nuxtjs/style-resources",
    "@inkline/nuxt",
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
        langDir: "locales/",
      },
    ],
  ],
  pwa: {
    icon: {
      fileName: "icon.png",
    },
    manifest: {
      name: (process.env.APP_NAME ? process.env.APP_NAME : "zkWallet v.2.0-beta") + (process.env.APP_CURRENT_NETWORK ? ` |  ETH Network: ${process.env.APP_CURRENT_NETWORK}` : ""),
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
        en: require("./locales/en/translations.json"),
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

  /*
   ** Build configuration
   */
  build: {
    extend(config, { isDev, isClient }) {
      config.node = {
        fs: "empty",
      };
    },
  },
};
