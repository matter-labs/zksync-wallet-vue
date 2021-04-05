import Vue from "vue";

import { BigNumber } from "ethers";
import VueScrollTo from "vue-scrollto";

import Loader from "@/components/loader.vue";
import { TokenSymbol } from "@/plugins/types";
import utils from "@/plugins/utils";
import moment from "moment";

Vue.use(VueScrollTo);

Vue.component("Loader", Loader);

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatToken", (value: string, symbol: TokenSymbol) => {
  return utils.handleFormatToken(symbol, value);
});

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatUsdAmount", (value: string | BigNumber, price: string, symbol: TokenSymbol) => {
  return utils.getFormattedTotalPrice(Number(price), +utils.handleFormatToken(symbol, <string>value));
});

/**
 * Format date as a human-readable "XX ago"
 * @todo consider switching with some ready component
 * Filtering human-readable time
 */
Vue.filter("formatTimeAgo", (time: moment.Moment | Date | string | number | (number | string)[] | moment.MomentInputObject | null | undefined) => moment(time).fromNow());

/**
 * Format date as a human-readable "XX ago"
 */
Vue.filter("formatDateTime", (time: moment.Moment | Date | string | number | (number | string)[] | moment.MomentInputObject | null | undefined) =>
  moment(time).format("M/D/YYYY h:mm:ss A"),
);

/**
 * Format date as a human-readable "XX ago"
 */
Vue.filter("formatTimeAgo", (time: moment.MomentInput) => moment(time).fromNow());

/**
 * Format date as a human-readable "XX ago"
 */
Vue.filter("formatDateTime", (time: moment.MomentInput) => moment(time).format("M/D/YYYY h:mm:ss A"));
