import * as functions from "firebase-functions";
/**
 * Proxy request to mixpanel api
 *
 * @param request
 * @param response
 */
export function mixpanelProxyFunction(request: functions.Request, response: functions.Response): void {
  const mixpanelURL = "https://api.mixpanel.com";
  let ip = request.ip;
  if(request.headers['HTTP_X_FORWARDED_FOR']) {
    ip = <string>request.headers['HTTP_X_FORWARDED_FOR'];
  } else if(request.headers['HTTP_X_REAL_IP']) {
    ip = <string>request.headers['HTTP_X_REAL_IP'];
  }
  
  const Http = new XMLHttpRequest();
  Http.setRequestHeader("X-REAL-IP", ip);
  Http.open(request.method, mixpanelURL+request.path.replace("/tunnel", "")+"?"+request.query);
  Http.send(request.body);

  Http.onreadystatechange = () => {
    response.status(Http.status).contentType(Http.responseType).set(Http.getAllResponseHeaders()).send(Http.responseText).end();
  }
}