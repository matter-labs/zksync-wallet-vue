import * as functions from "firebase-functions";
import { createHmac, BinaryLike } from "crypto";

type Network = "mainnet";

/**
 * The Banxa API implements an HMAC authentication strategy which requires the payload of the message to be hashed.
 * The hashing of the payload needs to be correct, otherwise, the API request will be rejected.
 *
 * @link https://docs.banxa.com/docs/step-3-authentication#signature
 *
 * @param {functions.Request} request
 * @param {functions.Response} response
 * @return void
 */
export function banxaAuthFunction(request: functions.Request, response: functions.Response): void {
  if (!request.headers["content-type"].includes("application/json")) {
    throw new functions.https.HttpsError("unavailable", "Expected application/json");
  }
  const data: { nonce?: string; dataToSign?: BinaryLike; ethNetwork?: string } = request.body;
  if (!data?.nonce || !data?.dataToSign) {
    throw new functions.https.HttpsError("invalid-argument", "Requested nonce or/and dataToSign are invalid");
  }

  const banxaConfig: Record<Network, { api_key: string; secret_key: string }> | undefined =
    functions.config().providers.banxa;

  if (!banxaConfig) {
    throw new functions.https.HttpsError("failed-precondition", "Banxa config is missing");
  }

  if (!data.ethNetwork || !banxaConfig[data.ethNetwork]) {
    throw new functions.https.HttpsError("invalid-argument", `Requested network ${data.ethNetwork} is not supported`);
  }

  const apiKey = banxaConfig[data.ethNetwork].api_key;
  const secretKey = banxaConfig[data.ethNetwork].secret_key;

  if (!apiKey || !secretKey) {
    throw new functions.https.HttpsError("failed-precondition", "Banxa config is invalid");
  }

  const localSignature = createHmac("SHA256", secretKey).update(data.dataToSign).digest("hex");

  const responseData = {
    bearer: `${apiKey}:${localSignature}:${data.nonce}`,
    nonce: data.nonce,
  };

  response.status(200);
  response.send(responseData);
}
