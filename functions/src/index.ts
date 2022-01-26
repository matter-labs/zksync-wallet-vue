import {moonpaySignFunction} from "./functions/moonpay.sign.js";
import {banxaAuthFunction} from "./functions/banxa.auth.js";
import {mixpanelProxyFunction} from "./functions/mixpanel.proxy.js";
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

/**
 * Proxy requests to mixpanel with lambda
 * @function mixpanelProxy
 */
export const mixpanelProxy = handlerHelper(mixpanelProxyFunction, "mixpanel");