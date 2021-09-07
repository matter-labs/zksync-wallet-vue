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
 */
import { Plugin } from "@nuxt/types";
import OhVueIcon from "oh-vue-icons/dist/v2/icon.es";
import {
  BiDownload,
  RiAddCircleFill,
  RiAddFill,
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowLeftLine,
  RiArrowUpSLine,
  RiAtLine,
  RiBook2Line,
  RiCheckDoubleLine,
  RiCheckLine,
  RiClipboardLine,
  RiCloseCircleFill,
  RiContactsBookLine,
  RiContactsLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiGalleryLine,
  RiGithubFill,
  RiHandCoinFill,
  RiHistoryLine,
  RiInformationFill,
  RiLinkUnlinkM,
  RiLoader5Line,
  RiMoonFill,
  RiMore2Fill,
  RiNpmjsFill,
  RiPencilFill,
  RiPencilLine,
  RiProfileLine,
  RiQuestionMark,
  RiReservedFill,
  RiReservedLine,
  RiRestartLine,
  RiSearchLine,
  RiSendPlaneFill,
  RiSunFill,
  RiWalletLine,
  RiWifiLine,
} from "oh-vue-icons/icons";
import Vue from "vue";

/**
 * Special plugin to implement oh-awesome-icons into zkDapp
 */
const iconsPlugin: Plugin = (): void => {
  OhVueIcon.add(
    BiDownload,
    RiAddCircleFill,
    RiAddFill,
    RiArrowDownSLine,
    RiArrowGoBackLine,
    RiArrowLeftLine,
    RiArrowUpSLine,
    RiAtLine,
    RiBook2Line,
    RiCheckDoubleLine,
    RiCheckLine,
    RiClipboardLine,
    RiCloseCircleFill,
    RiContactsBookLine,
    RiContactsLine,
    RiDeleteBinLine,
    RiExternalLinkLine,
    RiGalleryLine,
    RiGithubFill,
    RiHandCoinFill,
    RiHistoryLine,
    RiInformationFill,
    RiLinkUnlinkM,
    RiLoader5Line,
    RiMoonFill,
    RiMore2Fill,
    RiNpmjsFill,
    RiPencilFill,
    RiPencilLine,
    RiProfileLine,
    RiQuestionMark,
    RiReservedFill,
    RiReservedLine,
    RiRestartLine,
    RiSearchLine,
    RiSendPlaneFill,
    RiSunFill,
    RiWalletLine,
    RiWifiLine,
  );

  Vue.component("VIcon", OhVueIcon);
};

export default iconsPlugin;
