import * as functions from "firebase-functions";

import {createHmac} from "crypto";

import {functionsConfig} from "../functions-config.js";

const publishableKey = functionsConfig?.moonpay?.pubKey;
const secretKey = functionsConfig?.moonpay?.secret;

/**
 * Signing Moonpay urls on server-side
 * @link https://www.moonpay.com/dashboard/getting_started/#step_3
 *
 * @param request
 * @param response
 */
export function moonpaySignFunction(request: functions.Request, response: functions.Response): void {
  if (!publishableKey || !secretKey) {
    throw new functions.https.HttpsError("failed-precondition", "moonpay config validation failed");
  }

  const data: { originalUrl?: string, pubKey?: string } = request.body;

  // Text parameter expected:
  //  `pk_test_key`
  if (data?.pubKey !== publishableKey) {
    throw new functions.https.HttpsError("invalid-argument", "pubKey validation failed");
  }

  // Valid URL expected:
  //  `https://buy-sandbox.moonpay.com?apiKey=pk_test_key&currencyCode=eth&walletAddress=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae`
  if (!data?.originalUrl) {
    throw new functions.https.HttpsError("invalid-argument", "originalUrl validation failed");
  }

  // @todo: Add environment validation

  const signature = createHmac("sha256", secretKey)
      .update(new URL(data.originalUrl).search)
      .digest("base64");

  response.status(200);
  response.json({
    message: "OK",
    signedUrl: `${data.originalUrl}&signature=${encodeURIComponent(signature)}`,
  });
}
