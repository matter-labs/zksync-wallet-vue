import { handlerHelper } from "./helpers/handlerHelper.js";
import { moonpaySignFunction } from "./functions/moonpay.sign.js";
import { banxaAuthFunction } from "./functions/banxa.auth.js";

/**
 * Banxa Authentication server-side lambda
 * @function banxa_auth
 */
export const banxaAuth = handlerHelper(banxaAuthFunction);

/**
 * Moonpay URL signing server-side lambda
 * @function moonpay_sing
 */
export const moonpaySign = handlerHelper(moonpaySignFunction);