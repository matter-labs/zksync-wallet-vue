import * as functions from "firebase-functions";
import cors from "cors";

/**
 * Common wrapper for the lambda-function with the logger & HttpsError processing
 *
 * @description Depending on the value of the process.env.FUNCTIONS_EMULATOR request would be processed with or without the CORS handling.
 *
 * @param handler
 * @return functions.TriggerAnnotated & ((req: functions.Request, resp: functions.Response) => (void | Promise<void>))
 */
export const handlerHelper = process.env.FUNCTIONS_EMULATOR
  ? (handler: CallableFunction) =>
      functions.https.onRequest((request: functions.Request, response: functions.Response): void => {
        cors({ origin: ["http://localhost:3000"] })(request, response, () => {
          try {
            handler(request, response);
          } catch (error) {
            functions.logger.error("handlerHelper Error captured:", error);
            response.status(500);
            response.send(error);
          }
        });
      })
  : (handler: CallableFunction) =>
      functions.https.onRequest((request: functions.Request, response: functions.Response): void => {
        try {
          handler(request, response);
        } catch (error) {
          functions.logger.error("handlerHelper Error captured:", error);
          response.status(500);
          response.send(error);
        }
      });