import * as functions from "firebase-functions";
import cors from "cors";

const options = {
  origin: true
};

/**
 * Common wrapper for the lambda-function with the logger & HttpsError processing
 *
 * @param handler
 * @return functions.TriggerAnnotated & ((req: functions.Request, resp: functions.Response) => (void | Promise<void>))
 */
export function handlerHelper(handler) {
  return functions.https.onRequest((request: functions.Request, response: functions.Response) => {
    cors(options)(request, response, () => {
      try {
        return handler(request, response);
      } catch (error) {
        functions.logger.error("handlerHelper Error captured:", error);
        functions.logger.error("request data", { url: request.url, method: request.method, bodyParams: request.body, function: handler.name });
        response.statusCode = 500;
        return response.send(error).end();
      }
    });
  });
}