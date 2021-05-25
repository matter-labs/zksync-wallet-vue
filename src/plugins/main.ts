import utils from "@/plugins/utils";
import { BigNumber } from "ethers";

import moment from "moment-timezone";

/**
 * Decision to switch from FontAwesome (as a web-font, full collection) was based on performance issues.
 * But replacing it with Remix Icons (same distribution form) wasn't enough.
 *
 * Now both packs are redundant and replaceable w/t the wrapping library oh-vue-icons:
 *  - tree-shaking support
 *  - access to crypto collection of icons (to improve the UI with token symbols)
 *  - on-build-transpiling support should solve everything
 *
 * @uses remixicon,oh-vue-icons
 * @link https://oh-vue-icons.netlify.app
 * @link
 */
import OhVueIcon from "oh-vue-icons";
import {
  BiDownload,
  IoWalletOutline,
  RiAddCircleFill,
  RiAddFill,
  RiAddLine,
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowLeftLine,
  RiAtLine,
  RiBook2Line,
  RiCheckDoubleLine,
  RiCheckLine,
  RiClipboardLine,
  RiCloseCircleFill,
  RiCloseCircleLine,
  RiContactsBookLine,
  RiContactsLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiGithubFill,
  RiHandCoinFill,
  RiHistoryLine,
  RiLinkUnlinkM,
  RiLoader5Line,
  RiMore2Fill,
  RiMore2Line,
  RiNpmjsFill,
  RiPencilFill,
  RiPencilLine,
  RiProfileLine,
  RiQuestionFill,
  RiQuestionMark,
  RiReservedFill,
  RiRestartLine,
  RiSearchLine,
  RiSendPlaneFill,
  RiWalletLine,
  RiArrowUpSLine,
} from "oh-vue-icons/icons";
import Vue from "vue";

import VueQrcode from "vue-qrcode";
import VueScrollTo from "vue-scrollto";

import { ToastAction, ToastOptions } from "vue-toasted";
import { TokenSymbol } from "zksync/build/types";

Vue.component("VueQrcode", VueQrcode);

Vue.use(VueScrollTo);
OhVueIcon.add(
  RiArrowUpSLine,
  RiArrowDownSLine,
  BiDownload,
  IoWalletOutline,
  RiCloseCircleFill,
  RiAddCircleFill,
  RiAtLine,
  RiCloseCircleLine,
  RiMore2Fill,
  RiMore2Line,
  RiSearchLine,
  RiHistoryLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiQuestionFill,
  RiQuestionMark,
  RiSendPlaneFill,
  RiExternalLinkLine,
  RiPencilLine,
  RiLinkUnlinkM,
  RiProfileLine,
  RiBook2Line,
  RiContactsBookLine,
  RiMore2Line,
  RiWalletLine,
  RiRestartLine,
  RiLoader5Line,
  RiNpmjsFill,
  RiGithubFill,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiHandCoinFill,
  RiAddFill,
  RiClipboardLine,
  RiArrowGoBackLine,
  RiAddLine,
  RiPencilFill,
  RiReservedFill,
  RiContactsLine,
  RiDeleteBinLine,
); // Used icons (to reduce bundle-size)
Vue.component("VIcon", OhVueIcon);

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter("formatToken", (value: string | BigNumber, symbol: TokenSymbol) => {
  return utils.handleFormatToken(symbol, value?.toString());
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
 * @uses vue-toasted npm-package
 */
Vue.toasted.register(
  "zkException",
  (payload: { message?: string }): string => {
    return payload.message ?? "Oops...Something went wrong";
  },
  <ToastOptions>{
    duration: 4000,
    className: "zkToastException",
    icon: "fa-times-circle",
    type: "error",
  },
);

/**
 * zkCancel — first implementation of “push” with route action (on testing)
 * @uses vue-toasted npm-package
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
