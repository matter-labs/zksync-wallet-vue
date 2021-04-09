import { walletData } from "@/plugins/walletData";
import { Address, Balance, DecimalBalance, GweiBalance, Token, TokenSymbol } from "@/plugins/types";
import { utils as zkUtils } from "zksync";
import { BigNumberish, utils } from "ethers";

/**
 *
 * @param symbol
 * @param amount
 * @return {BigNumber|*}
 */
function parseToken(symbol: TokenSymbol, amount: DecimalBalance) {
  return walletData.get().syncProvider!.tokenSet.parseToken(symbol, amount.toString());
}

function handleFormatToken(symbol: TokenSymbol, amount: GweiBalance | undefined) {
  if (!amount) return "0";
  return walletData.get().syncProvider!.tokenSet.formatToken(symbol, amount);
}

export default {
  parseToken,

  timeCalc: (timeInSec: number) => {
    const hours = Math.floor(timeInSec / 60 / 60);
    const minutes = Math.floor(timeInSec / 60) - hours * 60;
    const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

    return {
      hours,
      minutes,
      seconds,
    };
  },

  handleFormatToken,

  getFormattedTotalPrice: (price: number, amount: number) => {
    const total = price * amount;
    if (!amount || total === 0) {
      return "$0.00";
    }
    return total < 0.01 ? `<$0.01` : `~$${total.toFixed(2)}`;
  },

  /**
   * @param a
   * @param b
   * @return {number}
   */
  compareTokensById: (a: Token, b: Token) => {
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    }
    return 0;
  },

  /**
   * Soring by the token name
   * @param {Token} a
   * @param {Token} b
   * @returns {number}
   */
  sortBalancesAZ: (a: Balance, b: Balance) => {
    return a.symbol.localeCompare(b.symbol);
  },

  isAmountPackable: (amount: BigNumberish): boolean => {
    return zkUtils.isTransactionAmountPackable(amount);
  },

  validateAddress: (address: Address): boolean => {
    return utils.isAddress(address);
  },

  searchInArr: (search: string, list: Array<any>, searchParam: Function) => {
    if (!search.trim()) {
      return list;
    }
    search = search.trim().toLowerCase();
    return list.filter((e) => String(searchParam(e)).toLowerCase().includes(search));
  },
};
