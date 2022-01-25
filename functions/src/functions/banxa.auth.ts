import * as functions from "firebase-functions";
import {createHmac} from "crypto";
import {functionsConfig} from "../functions-config.js";

const key = functionsConfig.banxa.key;
const secret = functionsConfig.banxa.secret;

/**
 * The Banxa API implements an HMAC authentication strategy which requires the payload of the message to be hashed.
 * The hashing of the payload needs to be correct, otherwise, the API request will be rejected.
 *
 * @link https://docs.banxa.com/docs/step-3-authentication#signature
 * @param request
 * @param response
 */
export function banxaAuthFunction(request: functions.Request, response: functions.Response): void {
  const data: { dataToSign?, nonce?: string } = request.body;
  const localSignature = createHmac("SHA256", secret).update(data.dataToSign).digest("hex");

  response.status(200).json({
    // "Authorization: Bearer API Key:Signature:Nonce"
    bearerAuth: `${key}:${localSignature}:${data.nonce}`,
  }).end();
}