import { handlerHelper } from "./helpers/handlerHelper.js";
import { mixpanelTunnelFunction } from "./functions/mixpanel.tunnel.js";

/**
  * Proxy requests to mixpanel with lambda
  * @function mixpanelProxy
  */
export const mixpanelTunnel = handlerHelper(mixpanelTunnelFunction);