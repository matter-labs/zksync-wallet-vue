module.exports = {
  extends: [
    "@matterlabs/eslint-config-nuxt"
  ],
  overrides: [
    {
      files: ["**icons.ts"],
      rules: {
        "import/default": "off"
      }
    },
    {
      files: ["SocialBlock.vue"],
      rules: {
        "vue/no-v-html": "off"
      }
    },
    {
      files: ["Transaction.vue", "_address.vue"],
      rules: {
        "no-unused-expressions": "off"
      }
    }
  ]
};
