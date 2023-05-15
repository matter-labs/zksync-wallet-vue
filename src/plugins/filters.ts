import Vue from "vue";
import moment from "moment-timezone";
import { Plugin } from "@nuxt/types";

const filtersPlugin: Plugin = () => {
  Vue.filter("formatDateTime", (time: moment.MomentInput) => moment(time).format("M/D/YYYY h:mm:ss A"));
};

export default filtersPlugin;
