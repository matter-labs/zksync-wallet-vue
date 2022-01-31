import * as functions from "firebase-functions";
import cors from "cors";
import {functionsConfig} from "../functions-config.js";

/**
 * Common wrapper for the lambda-function with the logger & HttpsError processing
 *
 * @param handler
 * @param configCheck
 * @return functions.TriggerAnnotated & ((req: functions.Request, resp: functions.Response) => (void | Promise<void>))
 */
const handlerHelper: (handler, configCheck?: string) => functions.TriggerAnnotated & ((req: functions.Request, resp: functions.Response) => (void | Promise<void>)) = (handler, configCheck = undefined) => functions.https.onRequest((request: functions.Request, response: functions.Response) => {
  if (configCheck !== undefined && functionsConfig[configCheck]!.enabled !== true) {
    response.statusMessage = `${handler.name} is currently disabled`;
    response.sendStatus(404);
  }
    try {
      handler(request, response);
    } catch (error) {
      functions.logger.debug("handlerHelper Error captured:", {
        error,
        requested: {
          url: request.url,
          method: request.method,
          bodyParams: request.body,
          function: handler.name,
        },
      });
      response.header(500).send(error).end();
    }
});

export default handlerHelper;
