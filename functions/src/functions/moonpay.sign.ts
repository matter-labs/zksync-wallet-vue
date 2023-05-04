import * as functions from "firebase-functions";
import { createHmac } from "crypto";

type Network = "mainnet";

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
  const data: { originalUrl?: string; pubKey?: string; ethNetwork?: Network | string } = request.body;

  if (!data) {
    throw new functions.https.HttpsError("invalid-argument", "No body provided");
  }

  if (!data.originalUrl) {
    throw new functions.https.HttpsError("invalid-argument", "Requested originalUrl is invalid");
  }

  const moonpayConfig: Record<Network, { pub_key: string; secret_key: string }> | undefined =
    functions.config().providers.moonpay;

  if (!moonpayConfig) {
    throw new functions.https.HttpsError("failed-precondition", "Moonpay config is missing");
  }

  if (!data.ethNetwork || !moonpayConfig[data.ethNetwork]) {
    throw new functions.https.HttpsError("invalid-argument", `Requested network ${data.ethNetwork} is not supported`);
  }

  const secretKey = moonpayConfig[data.ethNetwork].secret_key;

  if (!secretKey) {
    throw new functions.https.HttpsError("failed-precondition", "Moonpay config is invalid");
  }

  const signature = createHmac("sha256", secretKey).update(new URL(data.originalUrl).search).digest("base64");

  const resultSignedUrl = `${data.originalUrl}&signature=${encodeURIComponent(signature)}`;

  response.status(200);
  response.send({
    signedUrl: resultSignedUrl,
  });
}
