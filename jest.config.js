module.exports = {
  preset: "@nuxt/test-utils",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^~/(.*)$": "<rootDir>/src/$1",
    "^vue$": "vue/dist/vue.common.js",
  },
  transform: {
    "^.+\\.ts?$": "ts-jest",
    ".*\\.(vue)$": "vue-jest",
    "^.+\\.(js|ts|jsx)?$": "babel-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  moduleFileExtensions: ["ts", "js", "vue", "json"],

  collectCoverageFrom: ["components/**/*.vue", "blocks/**/*.vue", "layouts/**/*.vue", "pages/**/*.vue", "plugins/**/*.ts", "store/**/*.ts"],
};
