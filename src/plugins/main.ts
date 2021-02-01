import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';
import utils from '@/plugins/utils';
import Loader from '@/components/loader.vue';
import { GweiBalance, TokenSymbol } from '@/plugins/types';
import { BigNumber } from 'ethers';

Vue.use(VueScrollTo);

Vue.component('Loader', Loader);

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter('formatToken', (value: GweiBalance, symbol: TokenSymbol) => {
  return utils.handleFormatToken(symbol, value);
});

/**
 * Implementation of the tokenFormatter as a global filter
 */
Vue.filter('formatUsdAmount', (value: string | BigNumber, price: string, symbol: TokenSymbol) => {
  return utils.getFormattedTotalPrice(Number(price), +utils.handleFormatToken(symbol, <string>value));
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
