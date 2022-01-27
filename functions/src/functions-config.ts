/**
 * Functions configuration.
 */
export const functionsConfig = {
  whitelist: [
    "http://localhost:5001",
    "http://localhost:3000",
    "https://zksync-vue--version-refs-pull-218-merge-15r9pbf9.web.app",
    "https://wallet.zksync.io"
  ],
  allowedMethod: "post",
  banxa: {
    enabled: false,
    key: "",
    secret: "",
  },
  moonpay: {
    enabled: true,
    pubKey: "",
    secret: "",
  },
  mixpanel: {
    enabled: true,
    pubKey: "",
    secret: "",
  },
};