module.exports = {
  extends: ["@matterlabs/eslint-config-nuxt"],
  overrides: [
    {
      files: ["analytics.ts"],
      rules: {
        "import/no-named-as-default-member": "off",
      },
    },
    {
      files: ["**icons.ts", "analytics.ts"],
      rules: {
        "import/default": "off",
      },
    },
    {
      files: ["Transaction.vue", "_address.vue"],
      rules: {
        "no-unused-expressions": "off",
      },
    },
    {
      files: ["AccountModal.vue"],
      rules: {
        "no-implicit-any": "off",
      },
    },
  ],
};
