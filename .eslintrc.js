module.exports = {
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:vue/recommended", "plugin:vue/base", "plugin:prettier-vue/recommended"],
  settings: {
    "prettier-vue": {
      // Settings for how to process Vue SFC Blocks
      SFCBlocks: {
        /**
         * Use prettier to process `<template>` blocks or not
         *
         * If set to `false`, remember not to `extends: ['prettier/vue']`, as you need the rules from `eslint-plugin-vue` to lint `<template>` blocks
         *
         * @default true
         */
        template: true,

        /**
         * Use prettier to process `<script>` blocks or not
         *
         * @default true
         */
        script: true,

        /**
         * Use prettier to process `<style>` blocks or not
         *
         * @default true
         */
        style: true,

        // Settings for how to process custom blocks
        customBlocks: {
          // Treat the `<docs>` block as a `.markdown` file
          docs: { lang: "markdown" },

          // Treat the `<config>` block as a `.json` file
          config: { lang: "json" },

          // Treat the `<module>` block as a `.js` file
          module: { lang: "js" },

          // Ignore `<comments>` block (omit it or set it to `false` to ignore the block)
          comments: false,

          // Other custom blocks that are not listed here will be ignored
        },
      },

      // Use prettierrc for prettier options or not (default: `true`)
      usePrettierrc: true,

      // Set the options for `prettier.getFileInfo`.
      // @see https://prettier.io/docs/en/api.html#prettiergetfileinfofilepath-options
      fileInfoOptions: {
        // Path to ignore file (default: `'.prettierignore'`)
        // Notice that the ignore file is only used for this plugin
        ignorePath: ".testignore",

        // Process the files in `node_modules` or not (default: `false`)
        withNodeModules: false,
      },
    },
  },
  rules: {
    "no-console": "off",
    "no-prototype-builtins": "off",
    "prettier-vue/prettier": [
      "error",
      {
        semi: true,
        trailingComma: "all",
        singleQuote: false,
        jsxSingleQuote: false,
        printWidth: 180,
        tabWidth: 2,
      },
    ],
    "no-unused-vars": "off",
    camelcase: "off",
    "@typescript-eslint/no-unused-vars": ["off"],
  },
};
