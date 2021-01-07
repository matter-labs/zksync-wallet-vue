import Vue from "vue";
import VueScrollTo from "vue-scrollto";
import utils from "@/plugins/utils";
import Loader from "@/components/loader.vue";

Vue.use(VueScrollTo);

Vue.component("Loader", Loader);

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatToken", (value, symbol) => {
  return utils.handleFormatToken(symbol, value);
});

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatUsdAmount", (value, price, symbol) => {
  return utils.getFormatedTotalPrice(price, utils.handleFormatToken(symbol, value));
});

/**
 * Filtering human-readable time
 */
Vue.filter("getTimeString", (value) => {
  let { hours, minutes, seconds } = utils.timeCalc(value);
  return `${hours ? utils.handleTimeAmount(hours, "hour") : ""}
              ${minutes ? utils.handleTimeAmount(minutes, "minute") : ""}
              ${seconds ? utils.handleTimeAmount(seconds, "second") : ""}`;
});
