import http from "http";
import * as functions from "firebase-functions";

type QueryEntryPrimitive = string | number | boolean;
interface QueryEntry {
  [key: string | number]: QueryEntryPrimitive | Array<QueryEntryPrimitive | QueryEntry> | QueryEntry;
}

/**
 * Encode object into query params
 *
 * @param obj
 */
function serialize(obj: QueryEntry, prefix?: string) {
  const str = [];
  for (const p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      const k = prefix ? prefix + "[" + p + "]" : p;
      const v = obj[p];
      str.push(v !== null && typeof v === "object" ? serialize(v as QueryEntry, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v as string));
    }
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
  if(request.get["HTTP_X_FORWARDED_FOR"]) {
    ip = request.get["HTTP_X_FORWARDED_FOR"];
  } else if(request.get["HTTP_X_REAL_IP"]) {
    ip = request.get["HTTP_X_REAL_IP"];
  }

  try {
    const mixpanelRequest = http.request({
      host: mixpanelHost,
      path: request.url.replace("/tunnel/mixpanel", ""),
      method: request.method,
      headers: ip ? { "X-REAL-IP": ip } : undefined,
    }, (mixpanelResponse => {
      let mixpanelResponseBodyStr = "";

      //another chunk of data has been received, so append it to `mixpanelResponseBodyStr`
      mixpanelResponse.on("data", (chunk) => {
        mixpanelResponseBodyStr += chunk;
      });

      //the whole response has been received
      mixpanelResponse.on("end", () => {
        for (const headerName in mixpanelResponse.headers) {
          const excludedHeaders = ["content-encoding", "content-length", "transfer-encoding", "connection", "access-control-allow-credentials", "access-control-allow-origin"];
          if (excludedHeaders.includes(headerName)) {
            continue;
          }
          response.setHeader(headerName, mixpanelResponse.headers[headerName]);
        }
        response.status(mixpanelResponse.statusCode).send(mixpanelResponseBodyStr);
      });
    }))
    .on("error", (error) => {
      functions.logger.error(error);
      response.status(500).send(error?.message);
    });
    mixpanelRequest.write(typeof request.body === "object" ? serialize(request.body) : request.body);
    mixpanelRequest.end();
  } catch (error) {
    functions.logger.error(error);
    throw new functions.https.HttpsError("aborted", error);
  }
}