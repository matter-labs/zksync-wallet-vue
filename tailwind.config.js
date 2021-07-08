import tailwindDefault from "tailwindcss/defaultTheme";

module.exports = {
  darkMode: "media",
  corePlugins: {
    preflight: false,
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["src/components/**/*.vue", "src/blocks/**/*.vue", "src/layouts/**/*.vue", "src/pages/**/*.vue", "src/plugins/**/*.{js,ts}", "nuxt.config.ts"],
  },
  theme: {
    borderColor: {
      /* light: "#E1E4E8", */
    },
    backgroundColor: {
      /* white: "#FFFFFF", */
    },
    textColor: {
      /* white: "#FFFFFF", */
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
      firaCode: ["Fira Code", "sans-serif"],
      firaSans: ["Fira Sans", "sans-serif"],
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
