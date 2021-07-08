const tailwindDefault = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "media",
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["components/**/*.vue", "blocks/**/*.vue", "blocks/**/*.vue", "layouts/**/*.vue", "pages/**/*.vue", "plugins/**/*.{js,ts}", "nuxt.config.ts"],
  },
  theme: {
    borderColor: {
      light: "#E1E4E8",
      gray: "#8D9AAC",
    },
    backgroundColor: {
      white: "#FFFFFF",
      white2: "#FBFBFB",
      white3: "#F4F5F7",
      violet: "#5436D6",
    },
    textColor: {
      white: "#FFFFFF",
      gray: "#8D9AAC",
      dark: "#243955",
      dark2: "#4E566D",
      black2: "#343a40",
      black: "#000",
      violet: "#5436D6",
      lightviolet: "#7860df",
      red: "#F25F5C",
      green: "#057A55",
      yellow: "#fbbf24",
    },
    fontSize: {
      ...tailwindDefault.fontSize,
      xxs: [
        "0.65rem",
        {
          lineHeight: "0.75rem",
        },
      ],
    },
    maxWidth: {
      ...tailwindDefault.maxWidth,
      xxs: "15rem",
    },
    fontFamily: {
      ...tailwindDefault.fontFamily,
      firaSans: ["Fira Sans", "sans-serif"],
      firaCode: ["Fira Code", "sans-serif"],
    },
    screens: {
      ...tailwindDefault.screens,
      lg: "1101px",
    },
    extend: {
      width: {
        "max-content": "max-content",
      },
    },
  },
  variants: {
    extend: {
      visibility: ["hover", "focus"],
      flex: ["hover", "focus"],
    },
  },
  plugins: [],
};
