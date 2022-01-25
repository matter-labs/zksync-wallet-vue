import {moonpaySignFunction} from "./functions/moonpay.sign.js";
import {banxaAuthFunction} from "./functions/banxa.auth.js";
import handlerHelper from "./helpers/handler.js";

/**
 * Banxa Authentication server-side lambda
 * @function banxa_auth
 */
export const banxaAuth = handlerHelper(banxaAuthFunction, "banxa");

/**
 * Moonpay URL signing server-side lambda
 * @function moonpay_sing
 */
export const moonpaySign = handlerHelper(moonpaySignFunction, "moonpay");