module.exports = {
  env: {
    browser: true,
    node: true
  },
  root: true,
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:prettier-vue/recommended",
    "prettier",
  ],
  "parserOptions": {
    parser: "@typescript-eslint/parser",
    extraFileExtensions: ['.vue'],
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    },
    tsconfigRootDir: __dirname,
  },
  plugins: ["prettier"],
  rules: {
    indent: "off",
    semi: ["error", "always"],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-undef": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    camelcase: "off",
    "no-console": "off",
    quotes: ["error", "double"],
    "sort-imports": "off",
    "vue/no-v-for-template-key-on-child": "off",
    "vue/no-v-html": "off",
    "vue/html-self-closing": "off",
    "pt-eslint/no-explicit-any": "off",
    "no-prototype-builtins": "off",
    "no-unused-expressions": "off",
    "no-use-before-define": "off",
    "vue/singleline-html-element-content-newline": "off",
    "@typescript-eslint/no-empty-function": ["off"],
    "vue/max-attribute": "off",
    "vue/require-prop-types": "off",
    "import/no-named-as-default-member": "off",
    "vue/multi-word-component-names": "off",
    "prettier-vue/prettier": [
      'error',
      {
        // Override all options of `prettier` here
        // @see https://prettier.io/docs/en/options.html
        semi: true,
        trailingComma: "es5",
        singleQuote: false,
        jsxSingleQuote: false,
        printWidth: 180,
        tabWidth: 2,
        vueIndentScriptAndStyle: false,
        endOfLine: "lf",
        bracketSpacing: false,
        bracketSameLine: true,
      },
    ],
  },
  settings: {
    "prettier-vue": {
      SFCBlocks: {
        /**
         * Use prettier to process `<template>` blocks or not
         *
         * If set to `false`, you may need to enable those vue rules that are disabled by `eslint-config-prettier`,
         * because you need them to lint `<template>` blocks
         *
         * @default true
         */
        template: true,

        /**
         * Use prettier to process `<script>` blocks or not
         *
         * If set to `false`, you may need to enable those rules that are disabled by `eslint-config-prettier`,
         * because you need them to lint `<script>` blocks
         *
         * @default true
         */
        script: true,

        /**
         * Use prettier to process `<style>` blocks or not
         *
         * @default true
         */
        style: true
      },
      // Use prettierrc for prettier options or not (default: `true`)
      usePrettierrc: true,

      // Set the options for `prettier.getFileInfo`.
      // @see https://prettier.io/docs/en/api.html#prettiergetfileinfofilepath-options
      fileInfoOptions: {
        // Path to ignore file (default: `'.prettierignore'`)
        // Notice that the ignore file is only used for this plugin
        ignorePath: ".prettierignore",

        // Process the files in `node_modules` or not (default: `false`)
        withNodeModules: false
      }
    }
  }
};