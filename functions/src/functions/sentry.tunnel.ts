import * as functions from "firebase-functions";
import fetch from "node-fetch";

/**
 * Signing Moonpay urls on server-side
 * @link https://www.moonpay.com/dashboard/getting_started/#step_3
 *
 * @param {functions.Request} request
 * @param {functions.Response} response
 * @return Promise<void>
 */
export const sentryTunnelFunction = (request: functions.Request, response: functions.Response): void => {
  const envelope = request.body;

  // functions.logger.debug("envelope", envelope);

  // functions.logger.debug("config", functions.config().sentry);

  const projectId = functions.config().tunnel.sentry.project_id;
  const host = functions.config().tunnel.sentry.project_host;

  const [rawHeader, ...restPieces] = envelope.split("\n");

  const header = JSON.parse(rawHeader);

  // omitted: check DSN, host, project ID

  const bodyEncoded = [
    // HACK: Attempt to communicate the real client IP address to Sentry.
    //       The `forwarded_for` field was deduced from a test in Sentry's
    //       Relay (server) handling of the Envelope format,
    //       cf. https://git.io/JPwWP
    JSON.stringify({
                     ...header, forwarded_for: typeof request.headers["x-forwarded-for"] === "string" ? request.headers["x-forwarded-for"] : request.socket.remoteAddress
                   }), ...restPieces
  ].join("\n");

  fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: "POST", body: bodyEncoded
  })
  .then((sentryResponse) => {
    // functions.logger.debug("sentry response", sentryResponse);

    if (sentryResponse.status !== 200) {
      throw new functions.https.HttpsError("internal", `Looks like there was a problem. Status Code: ${sentryResponse.status}`);
    }
    return sentryResponse.json();
  })
  .then((data) => {
    // functions.logger.debug("sentry json data", data);
    response.status(200);
    response.send(data);
  })
  .catch((err) => {
    functions.logger.error("sentry error", err);
    throw new functions.https.HttpsError("internal", err.toString());
  });
};