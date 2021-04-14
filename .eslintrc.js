module.exports = {
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended", "plugin:vue/base", "prettier"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2018,
    sourceType: "module",
    extraFileExtensions: [".vue"],
  },
  root: true,
  env: {
    node: true,
    browser: true,
  },
  rules: {
    // enable additional rules
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    camelcase: "off",
    semi: ["error", "always"],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-console": "off",
    "@typescript-eslint/no-empty-function": ["off"],
  },
};
