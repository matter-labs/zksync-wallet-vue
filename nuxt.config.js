require("dotenv").config();

export default {
  ssr: false,
  srcDir: __dirname,

  env: {
    ...process.env,
  },

  /*
   ** Headers of the page
   */
  head: {
    title: (process.env.APP_NAME ? process.env.APP_NAME : "zkWallet v.2.*") + (process.env.APP_CURRENT_NETWORK ? ` |  ETH Network: ${process.env.APP_CURRENT_NETWORK}` : ""),
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
        content: "/favicon.png",
      },
      { hid: "theme-color", name: "theme-color", content: "#e33d4f" },
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
  loading: { color: "#4e529a" },
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
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/dotenv",
    "@nuxtjs/axios",
    /* '@nuxtjs/auth', */
    "@nuxtjs/pwa",
    "@nuxtjs/toast",
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
  manifest: {
    name: "zkSync",
    short_name: "zkSync",
    description: "zkSync description",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e33d4f",
  },
  toast: {
    position: "bottom-right",
    duration: 5000,
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
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.NUXT_API_BASE_URL || process.env.APP_URL + "/api",
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: "/auth/login", method: "post", propertyName: "access_token" },
          logout: { url: "/auth/logout", method: "post" },
          user: { url: "/auth/user", method: "post", propertyName: "user" },
        },
        redirect: {
          login: "/auth/login",
          logout: "/",
          callback: "/auth/login",
          home: "/",
        },
      },
    },
  },

  /*
   ** Build configuration
   */
  build: {
    analyze: true,
    extend(config, { isDev, isClient }) {
      config.node = {
        fs: "empty",
      };
    },
  },
};
