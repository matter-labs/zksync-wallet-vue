import * as functions from "firebase-functions";
import {createHmac} from "crypto";

const key = "";
const secret = "";

/**
 * The Banxa API implements an HMAC authentication strategy which requires the payload of the message to be hashed.
 * The hashing of the payload needs to be correct, otherwise, the API request will be rejected.
 *
 * @link https://docs.banxa.com/docs/step-3-authentication#signature
 * @param request
 * @param response
 */
export function banxaAuthFunction(request: functions.Request, response: functions.Response) {
  const data: { dataToSign?, nonce?: string } = request.body;
  const localSignature = createHmac("SHA256", secret).update(data.dataToSign).digest("hex");

  response.statusCode = 200;
  return response.json({
    // "Authorization: Bearer API Key:Signature:Nonce"
    bearerAuth: `${key}:${localSignature}:${data.nonce}`,
  });
}