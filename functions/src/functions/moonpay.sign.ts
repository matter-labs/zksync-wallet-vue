import * as functions from "firebase-functions";
import {createHmac} from "crypto";
import {URL} from "url";

/**
 * Signing Moonpay urls on server-side
 * @link https://www.moonpay.com/dashboard/getting_started/#step_3
 *
 * @param request
 * @param response
 */
export function moonpaySignFunction(request: functions.Request, response: functions.Response) {

  const data: { originalUrl?: string, pubKey?: string, ethNetwork?: "rinkeby" | "mainnet" | string } = typeof request.body === "string" ? JSON.parse(request.body) : request.body;

  functions.logger.debug("requested data", data)

  // Valid URL expected:
  //  `https://buy-sandbox.moonpay.com?apiKey=pk_test_key&currencyCode=eth&walletAddress=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae`
  if (!data?.originalUrl) {
    throw new functions.https.HttpsError("invalid-argument", "originalUrl validation failed");
  }

  if (!data?.ethNetwork || !["rinkeby", "mainnet"].includes(data.ethNetwork)) {
    throw new functions.https.HttpsError("invalid-argument", "ethNetwork validation failed");
  }

  const moonpayConfig = functions.config().providers.moonpay;

  const publishableKey = data.ethNetwork === "rinkeby" ? moonpayConfig.rinkeby.pub_key : moonpayConfig.mainnet.pub_key;
  const secretKey = data.ethNetwork === "rinkeby" ? moonpayConfig.rinkeby.secret_key : moonpayConfig.mainnet.secret_key;

  if (!publishableKey || !secretKey) {
    throw new functions.https.HttpsError("failed-precondition", "moonpay config validation failed");
  }

  // Text parameter expected:
  //  `pk_test_key`
  if (data?.pubKey !== publishableKey) {
    throw new functions.https.HttpsError("invalid-argument", "pubKey validation failed");
  }

  const signature = createHmac("sha256", secretKey)
      .update(new URL(data.originalUrl).search)
      .digest("base64");

  const responseData = {
    message: "OK", signedUrl: `${data.originalUrl}&signature=${encodeURIComponent(signature)}`,
  };
  functions.logger.debug("response", responseData)
  response.statusCode = 200;
  return response.json(responseData);
}