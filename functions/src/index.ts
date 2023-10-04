import { handlerHelper } from "./helpers/handlerHelper.js";
import { moonpaySignFunction } from "./functions/moonpay.sign.js";
import { sentryTunnelFunction } from "./functions/sentry.tunnel.js";
import { mixpanelTunnelFunction } from "./functions/mixpanel.tunnel.js";

/**
 * Moonpay URL signing server-side lambda
 * @function moonpay_sing
 */
export const moonpaySign = handlerHelper(moonpaySignFunction);

/**
 * Proxy requests to mixpanel with lambda
 * @function mixpanel_proxy
 */
export const mixpanelTunnel = handlerHelper(mixpanelTunnelFunction);

/**
 * Sentry tunneling to deal with cross-site-blockers
 * @function sentry_tunnel
 */
export const sentryTunnel = handlerHelper(sentryTunnelFunction);
