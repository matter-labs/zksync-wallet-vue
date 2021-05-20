module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:nuxt/recommended", "plugin:prettier/recommended", "prettier"],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
      ecmaVersion: 6,
      sourceType: "module",
      ecmaFeatures: {
        "jsx": true
      }
    },
    extraFileExtensions: [".vue", ".ts", ".scss", ".js"],
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.js'],
  plugins: ["vue", "@typescript-eslint", "prettier"],
  root: true,
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-undef": "off",
    "@typescript-eslint/no-unused-vars": "off",
    camelcase: "off",
    "no-console": "off",
    "no-unused-expressions": "off",
    "prettier/prettier": "error",
    quotes: ["error", "double"],
    "sort-imports": "off",
    "vue/no-v-for-template-key-on-child": "off",
    "vue/no-v-html": "off",
  },
  settings: {
    "prettier-vue": {
      SFCBlocks: {
        template: true,
        script: true,
      },
      usePrettierrc: true,
    },
  },
};
