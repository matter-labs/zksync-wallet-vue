import Loader from "@/components/loader.vue";
import utils from "@/plugins/utils";
import { BigNumber } from "ethers";

import moment from "moment-timezone";
import Vue from "vue";
import VueScrollTo from "vue-scrollto";
import { ToastAction, ToastOptions } from "vue-toasted";
import { TokenSymbol } from "zksync/build/types";

Vue.use(VueScrollTo);

Vue.component("Loader", Loader);

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatToken", (value: string | BigNumber, symbol: TokenSymbol) => {
  return utils.handleFormatToken(symbol, value.toString());
});

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatUsdAmount", (value: string | BigNumber, price: number, symbol: TokenSymbol) => {
  return utils.getFormattedTotalPrice(Number(price), +utils.handleFormatToken(symbol, <string>value));
});

/**
 * Format date as a human-readable "XX ago"
 */
Vue.filter("formatTimeAgo", (time: moment.MomentInput) => moment(time).fromNow());

/**
 * Format date as a human-readable "M/D/YYYY h:mm:ss A"
 */
Vue.filter("formatDateTime", (time: moment.MomentInput) => moment(time).format("M/D/YYYY h:mm:ss A"));

/**
 * Format date as a human-readable "M/D/YYYY h:mm:ss A"
 */
Vue.filter("formatSeconds", (time: number) => utils.timeCalc(time));

/**
 * zkException error reporting toaster registered
 */
Vue.toasted.register(
  "zkException",
  (payload: { message?: string }): string => {
    return payload.message ?? "Oops...Something went wrong";
  },
  <ToastOptions>{
    duration: undefined,
    className: "zkToastException",
    icon: "fa-times-circle",
    type: "error",
  },
);

/**
 * zkCancel — first implementation of “push” with route action (on testing)
 */
Vue.toasted.register(
  "zkCancel",
  (payload: { message?: string; hasCancelRoute: boolean; name?: string; route?: string }) => {
    return payload.message ?? "Cancel last operation";
  },
  <ToastOptions>{
    type: "info",
    duration: 2000,
    icon: "fa-undo",
    className: "zkToastInfo",
    action: [
      <ToastAction>{
        text: "Cancel",
        className: "zkToastActionCancel",
        push: {
          name: "/action",
          dontClose: true,
        },
      },
    ],
  },
);
