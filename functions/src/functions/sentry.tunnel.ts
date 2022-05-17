import * as functions from "firebase-functions";
import fetch from "node-fetch";

/**
 * Tunneling sentry
 * @link https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option
 *
 * @param {functions.Request} request
 * @param {functions.Response} response
 * @return Promise<void>
 */
export function sentryTunnelFunction(request: functions.Request, response: functions.Response) {
  const envelope = request.body;

  const projectId = functions.config().tunnel.sentry.project_id;
  const host = functions.config().tunnel.sentry.project_host;

  const [rawHeader, ...restPieces] = envelope.split("\n");

  const header = JSON.parse(rawHeader);

  const bodyEncoded = [
    // HACK: Attempt to communicate the real client IP address to Sentry.
    //       The `forwarded_for` field was deduced from a test in Sentry's
    //       Relay (server) handling of the Envelope format,
    //       cf. https://git.io/JPwWP
    JSON.stringify({
      ...header,
      forwarded_for: typeof request.headers["x-forwarded-for"] === "string" ? request.headers["x-forwarded-for"] : request.socket.remoteAddress,
    }),
    ...restPieces,
  ].join("\n");

  fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: "POST",
    body: bodyEncoded,
  })
    .then((sentryResponse) => {
      if (!sentryResponse.ok) {
        throw new functions.https.HttpsError("internal", `Looks like there was a problem. Status Code: ${sentryResponse.status}`);
      }
      return sentryResponse.json();
    })
    .then((data) => {
      response.status(200);
      response.send(data);
    })
    .catch((e) => {
      response.status(500).send(e);
    });
}