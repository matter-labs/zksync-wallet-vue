/**
 * Functions configuration.
 */
export const functionsConfig = {
  whitelist: [
    "http://localhost:5001",
    "http://localhost:3000",
    "https://zksync-vue--version-refs-pull-213-merge-d8dwearx.web.app",
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
};