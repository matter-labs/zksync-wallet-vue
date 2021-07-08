export default {
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [{ path: "@/components/", prefix: "zk" }],

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "zksync-nuxt-ui",
    htmlAttrs: {
      lang: "en",
    },
    meta: [{ charset: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { hid: "description", name: "description", content: "" }],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Customize the progress-bar color
  loading: {
    color: "#8c8dfc",
    continuous: true,
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/assets/style/main.scss"],

  // Global scss variables https://github.com/nuxt-community/style-resources-module
  styleResources: {
    scss: "@/assets/style/_variables.scss",
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["@/plugins/main"],

  // Fonts loader https://www.npmjs.com/package/nuxt-webfontloader
  webfontloader: {
    google: {
      families: ["Fira+Sans:300,400,500,600", "Fira+Sans+Condensed:200,400,500,600", "Fira+Code:300"],
    },
  },

  // Storybook https://storybook.nuxtjs.org/
  storybook: {
    port: 4000,
    stories: ["@/stories/**/*.stories.js"],
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    // https://github.com/nuxt-community/style-resources-module
    "@nuxtjs/style-resources",
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    // https://www.npmjs.com/package/nuxt-webfontloader
    "nuxt-webfontloader",
  ],

  // Tailwind CSS https://tailwindcss.nuxtjs.org
  tailwindcss: {
    jit: true,
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
