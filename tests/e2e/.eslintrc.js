const path = require("path");

module.exports = {
  extends: `../../.eslintrc.js`,
  rules: {
    "ui-testing/no-css-page-layout-selector": ["warn", "cypress"],
  },
};
