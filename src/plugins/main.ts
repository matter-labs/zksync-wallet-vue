import Vue from "vue";
import VueScrollTo from "vue-scrollto";
import utils from "@/plugins/utils";
import Loader from "@/components/loader.vue";
import { TokenSymbol, GweiBalance } from "@/plugins/types";

Vue.use(VueScrollTo);

Vue.component("Loader", Loader);

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatToken", (value: GweiBalance, symbol: TokenSymbol) => {
  return utils.handleFormatToken(symbol, value);
});

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatUsdAmount", (value: string, price: number, symbol: TokenSymbol) => {
  return utils.getFormatedTotalPrice(price, +utils.handleFormatToken(symbol, value));
});

/**
 * Filtering human-readable time
 */
Vue.filter("getTimeString", (value: number) => {
  let { hours, minutes, seconds } = utils.timeCalc(value);
  return `${hours ? utils.handleTimeAmount(hours, "hour") : ""}
              ${minutes ? utils.handleTimeAmount(minutes, "minute") : ""}
              ${seconds ? utils.handleTimeAmount(seconds, "second") : ""}`;
});
