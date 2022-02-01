import * as functions from "firebase-functions";

/**
 * Common wrapper for the lambda-function with the logger & HttpsError processing
 *
 * @param handler
 * @return functions.TriggerAnnotated & ((req: functions.Request, resp: functions.Response) => (void | Promise<void>))
 */
export const handlerHelper = (handler: CallableFunction) => functions.https.onRequest((request: functions.Request, response: functions.Response) => {
  try {
    handler(request, response);
  } catch (error) {
    functions.logger.error("handlerHelper Error captured:", error);
    response.status(500);
    response.send(error);
  }
});