import { handlerHelper } from "./helpers/handlerHelper.js";
import { moonpaySignFunction } from "./functions/moonpay.sign.js";
import { banxaAuthFunction } from "./functions/banxa.auth.js";
import { sentryTunnelFunction } from "./functions/sentry.tunnel.js";

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
 * Sentry tunneling to deal with cross-site-blockers
 * @function moonpay_sing
 */
export const sentryTunnel = handlerHelper(sentryTunnelFunction);