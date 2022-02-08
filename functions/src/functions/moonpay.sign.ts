import * as functions from "firebase-functions";
import { createHmac } from "crypto";

/**
 * Signing Moonpay urls on server-side
 * @link https://www.moonpay.com/dashboard/getting_started/#step_3
 *
 * @param {functions.Request} request
 * @param {functions.Response} response
 * @return void
 */
export function moonpaySignFunction(request: functions.Request, response: functions.Response): void {
  if (!request.headers["content-type"].includes("application/json")) {
    throw new functions.https.HttpsError("unavailable", "Expected application/json");
  }
  const data: { originalUrl?: string; pubKey?: string; ethNetwork?: "rinkeby" | "mainnet" | string } = request.body;

  // functions.logger.debug("requested data", data, typeof data);

  // Valid URL expected:
  // `https://buy-sandbox.moonpay.com?apiKey=pk_test_key&currencyCode=eth&walletAddress=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae`
  if (!data?.originalUrl) {
    throw new functions.https.HttpsError("invalid-argument", "Requested originalUrl is invalid");
  }

  if (!data?.ethNetwork || !["rinkeby", "mainnet"].includes(data.ethNetwork)) {
    throw new functions.https.HttpsError("invalid-argument", "Requested ethNetwork is invalid");
  }

  const moonpayConfig:
    | {
        rinkeby?: {
          pub_key: string;
          secret_key: string;
        };
        mainnet?: {
          pub_key: string;
          secret_key: string;
        };
      }
    | undefined = functions.config().providers.moonpay;

  if (!moonpayConfig) {
    throw new functions.https.HttpsError("failed-precondition", "Moonpay config is missing");
  }

  if ((data.ethNetwork === "rinkeby" && !moonpayConfig.rinkeby) || (data.ethNetwork === "mainnet" && !moonpayConfig.mainnet)) {
    throw new functions.https.HttpsError("failed-precondition", `Moonpay ${data.ethNetwork} config is missing`);
  }

  const publishableKey = data.ethNetwork === "rinkeby" ? moonpayConfig.rinkeby?.pub_key : moonpayConfig.mainnet?.pub_key;
  const secretKey = data.ethNetwork === "rinkeby" ? moonpayConfig.rinkeby?.secret_key : moonpayConfig.mainnet?.secret_key;

  if (!publishableKey || !secretKey) {
    throw new functions.https.HttpsError("failed-precondition", "Moonpay config is invalid");
  }

  if (data?.pubKey !== publishableKey) {
    throw new functions.https.HttpsError("invalid-argument", "Requested pubKey doesn't match configured for the signing");
  }

  const signature = createHmac("sha256", secretKey).update(new URL(data.originalUrl).search).digest("base64");

  const resultSignedUrl = `${data.originalUrl}&signature=${encodeURIComponent(signature)}`;

  // functions.logger.debug("signed url", resultSignedUrl);

  response.status(200);
  response.send({
    signedUrl: resultSignedUrl,
  });
}