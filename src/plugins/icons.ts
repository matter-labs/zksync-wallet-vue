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
  MdVpnkeyRound,
  RiGalleryLine,
  RiAddCircleFill,
  RiErrorWarningLine,
  RiAddFill,
  RiAddLine,
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
  RiCloseCircleLine,
  RiContactsBookLine,
  RiContactsLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiGithubFill,
  RiHandCoinFill,
  RiHistoryLine,
  RiInformationFill,
  RiLightbulbLine,
  RiLinkUnlinkM,
  RiLoader5Line,
  RiMoonFill,
  RiMore2Fill,
  RiMore2Line,
  RiNpmjsFill,
  RiPencilFill,
  RiPencilLine,
  RiProfileLine,
  RiQuestionFill,
  RiQuestionMark,
  RiReservedFill,
  RiReservedLine,
  RiRestartLine,
  RiSearchLine,
  RiSendPlaneFill,
  RiSunFill,
  RiWalletLine,
  RiWifiLine,
  RiFileLine,
  CoEthereum,
} from "oh-vue-icons/icons";
import Vue from "vue";

/**
 * Special plugin to implement oh-awesome-icons into zkDapp
 */
const iconsPlugin: Plugin = () => {
  OhVueIcon.add(
    MdVpnkeyRound,
    RiGalleryLine,
    RiInformationFill,
    RiArrowUpSLine,
    RiArrowDownSLine,
    RiErrorWarningLine,
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
    RiReservedLine,
    RiContactsLine,
    RiDeleteBinLine,
    RiWifiLine,
    RiFileLine,
    RiLightbulbLine,
    RiMoonFill,
    RiSunFill,
    CoEthereum,
  ); // Used icons (to reduce bundle-size)

  Vue.component("VIcon", OhVueIcon);
};

export default iconsPlugin;
