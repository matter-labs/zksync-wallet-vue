/**
 * Functions configuration.
 */
export const functionsConfig = {
  whitelist: [
    "http://localhost:5001",
    "http://localhost:3000",
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