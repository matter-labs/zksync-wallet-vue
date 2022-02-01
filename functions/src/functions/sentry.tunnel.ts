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
export const sentryTunnelFunction = async (request: functions.Request, response: functions.Response): Promise<void> => {
  const envelope = request.body;

  functions.logger.debug("envelope", envelope);

  functions.logger.debug("config", functions.config());

  const projectId = functions.config().tunnel.sentry.project_id;
  const host = functions.config().tunnel.sentry.project_host;

  const sentryResponse = await fetch(`https://${host}/api/${projectId}/envelope/`, {
    method: "POST", body: envelope
  });

  functions.logger.debug("sentry API response", sentryResponse);

  const responseData = await sentryResponse.json();
  functions.logger.debug("sentry API responded with:", responseData);
  response.status(200);
  response.json(responseData);
};