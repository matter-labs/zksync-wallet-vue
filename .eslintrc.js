module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "prettier", "plugin:vue/base"],
  parserOptions: {
    ecmaVersion: 12,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    project: ["tsconfig.json", "tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".vue", ".scss"],
  },
  ignorePatterns: ["node_modules"],
  plugins: ["vue", "@typescript-eslint", "prettier"],
  root: true,
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
    "prettier/prettier": "error",
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
  },
  settings: {
    "prettier-vue": {
      SFCBlocks: {
        template: true,
        script: true,
      },
      usePrettierrc: true,
      // Set the options for `prettier.getFileInfo`.
      // @see https://prettier.io/docs/en/api.html#prettiergetfileinfofilepath-options
      fileInfoOptions: {
        // Path to ignore file (default: `'.prettierignore'`)
        // Notice that the ignore file is only used for this plugin
        ignorePath: "..prettierignore",

        // Process the files in `node_modules` or not (default: `false`)
        withNodeModules: false,
      },
    },
  },
};
