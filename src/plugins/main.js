import Vue from "vue";
import VueScrollTo from "vue-scrollto";
import utils from "@/plugins/utils";
import Loader from "@/components/loader.vue";
import moment from "moment";

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
  return utils.getFormattedTotalPrice(price, utils.handleFormatToken(symbol, value));
});

/**
 * @todo consider switching with some ready component
 * Filtering human-readable time
 */
Vue.filter("getTimeString", (value) => {
  const { hours, minutes, seconds } = utils.timeCalc(value);
  return `${hours ? utils.handleTimeAmount(hours, "hour") : ""}
              ${minutes ? utils.handleTimeAmount(minutes, "minute") : ""}
              ${seconds ? utils.handleTimeAmount(seconds, "second") : ""}`;
});

/**
 * Format date as a human-readable "XX ago"
 */
Vue.filter("formatTimeAgo", (time) => moment(time).fromNow());

/**
 * Format date as a human-readable "XX ago"
 */
Vue.filter("formatDateTime", (time) => moment(time).format("M/D/YYYY h:mm:ss A"));
