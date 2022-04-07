module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es6: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.eslint.json"
    ]
  },
  plugins: [
    "@typescript-eslint",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {}
};