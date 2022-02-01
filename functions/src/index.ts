import { handlerHelper } from "./helpers/handlerHelper.js";
import { moonpaySignFunction } from "./functions/moonpay.sign.js";
import { banxaAuthFunction } from "./functions/banxa.auth.js";
import { mixpanelTunnelFunction } from "./functions/mixpanel.tunnel.js";

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

/**
 * Proxy requests to mixpanel with lambda
 * @function mixpanelProxy
 */
export const mixpanelTunnel = handlerHelper(mixpanelTunnelFunction);