import * as functions from "firebase-functions";
/**
 * Proxy request to mixpanel api
 *
 * @link https://docs.banxa.com/docs/step-3-authentication#signature
 * @param request
 * @param response
 */
export function mixpanelProxyFunction(request: functions.Request, response: functions.Response): void {
  const mixpanelURL = "https://api.mixpanel.com";
  const headers = {'X-REAL-IP': request.ip}

  response.status(200).json({
    request,
    response,
    requestKeys: Object.keys(request),
    responseKeys: Object.keys(response),
  }).end();
}