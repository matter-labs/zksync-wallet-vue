import http from "http";
import * as functions from "firebase-functions";

/**
 * Encode object into query params
 *
 * @param obj
 */
function serialize(obj: Object) {
  const str = [];
  for (const p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

/**
 * Proxy request to mixpanel api
 *
 * @param request
 * @param response
 */
export function mixpanelTunnelFunction(request: functions.Request, response: functions.Response): void {
  const mixpanelHost = "api.mixpanel.com";

  let ip = request.ip;
  if(request.headers['HTTP_X_FORWARDED_FOR']) {
    ip = <string>request.headers['HTTP_X_FORWARDED_FOR'];
  } else if(request.headers['HTTP_X_REAL_IP']) {
    ip = <string>request.headers['HTTP_X_REAL_IP'];
  }

  try {
    functions.logger.debug(`New Mixpanel tunnel request: ${request.method} ${request.url}`);
    const mixpanelRequest = http.request({
      host: mixpanelHost,
      path: request.url,
      method: request.method,
      headers: ip ? { 'X-REAL-IP': ip } : undefined,
    }, (mixpanelResponse => {
      let mixpanelResponseBodyStr = '';

      //another chunk of data has been received, so append it to `mixpanelResponseBodyStr`
      mixpanelResponse.on('data', (chunk) => {
        mixpanelResponseBodyStr += chunk;
      });

      //the whole response has been received
      mixpanelResponse.on('end', () => {
        functions.logger.debug("Mixpanel response code: ", mixpanelResponse.statusCode);
        functions.logger.debug("Mixpanel response body: ", mixpanelResponseBodyStr);
        for (const headerName in mixpanelResponse.headers) {
          const excludedHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'access-control-allow-credentials', 'access-control-allow-origin'];
          if (excludedHeaders.includes(headerName)) {continue}
          response.setHeader(headerName, mixpanelResponse.headers[headerName]);
        }
        response.status(mixpanelResponse.statusCode).send(mixpanelResponseBodyStr).end();
      });
    }));
    mixpanelRequest.write(typeof request.body === "object" ? serialize(request.body) : request.body);
    mixpanelRequest.end();
  } catch (error) {
    functions.logger.debug("Error while tunneling mixpanel", error);
    throw new functions.https.HttpsError("invalid-argument", `processing error2: ${error}`);
  }
}