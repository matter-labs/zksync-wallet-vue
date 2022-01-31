import * as functions from "firebase-functions";
import fetch from "node-fetch";

/**
 * Signing Moonpay urls on server-side
 * @link https://www.moonpay.com/dashboard/getting_started/#step_3
 *
 * @param request
 * @param response
 */
export const sentryTunnelFunction = async (request: functions.Request, response: functions.Response) => {
  try {
    const envelope = request.body;
    const projectId = functions.config().tunnel.sentry.project_id;
    const host = functions.config().tunnel.sentry.project_host;

    const sentryResponse = await fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: "POST", body: envelope
    });

    const responseData = await sentryResponse.json();
    response.statusCode = 200;
    return response.json(responseData);
  } catch (e) {
    functions.logger.error(e);
    response.statusCode = 500;
    return response.json({ status: "invalid request" });
  }
};