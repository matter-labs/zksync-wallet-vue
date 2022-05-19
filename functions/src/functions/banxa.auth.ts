import * as functions from "firebase-functions";
import { createHmac, BinaryLike } from "crypto";

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
  const data: { nonce?: string; dataToSign?: BinaryLike; ethNetwork?: "rinkeby" | "mainnet" } = request.body;
  if (!data?.nonce || !data?.dataToSign) {
    throw new functions.https.HttpsError("invalid-argument", "Requested nonce or/and dataTo Sign are invalid");
  }

  if (!data?.ethNetwork || !["rinkeby", "mainnet"].includes(data.ethNetwork)) {
    throw new functions.https.HttpsError("invalid-argument", "Requested ethNetwork is invalid");
  }

  const banxaConfig:
    | {
        rinkeby?: {
          base_url: string;
          api_key: string;
          secret_key: string;
        };
        mainnet?: {
          base_url: string;
          api_key: string;
          secret_key: string;
        };
      }
    | undefined = functions.config().providers.banxa;

  if (!banxaConfig) {
    throw new functions.https.HttpsError("failed-precondition", "Banxa config is missing");
  }

  if ((data.ethNetwork === "rinkeby" && !banxaConfig.rinkeby) || (data.ethNetwork === "mainnet" && !banxaConfig.mainnet)) {
    throw new functions.https.HttpsError("failed-precondition", `Banxa ${data.ethNetwork} config is missing`);
  }

  const apiKey = data.ethNetwork === "rinkeby" ? banxaConfig.rinkeby?.api_key : banxaConfig.mainnet?.api_key;
  const secretKey = data.ethNetwork === "rinkeby" ? banxaConfig.rinkeby?.secret_key : banxaConfig.mainnet?.secret_key;

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