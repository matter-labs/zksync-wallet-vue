import { walletData } from "@/plugins/walletData";
import { DecimalBalance, GweiBalance, ZkInBalance } from "@/plugins/types";
import { utils as zkUtils } from "zksync";
import { Address, TokenSymbol } from "zksync/build/types";
import { IPrototype } from "@inkline/inkline/src/plugin.d";

import { BigNumber, BigNumberish, utils } from "ethers";

/**
 *
 * @param symbol
 * @param amount
 * @return {BigNumber|*}
 */
function parseToken(symbol: TokenSymbol, amount: DecimalBalance): BigNumber {
  return walletData.get().syncProvider?.tokenSet?.parseToken(symbol, amount.toString()) || BigNumber.from("0");
}

/**
 * Formatting the token amount and symbol
 * @param {TokenSymbol} symbol
 * @param {GweiBalance} amount
 * @return {string}
 */
function handleFormatToken(symbol: TokenSymbol, amount: GweiBalance) {
  if (!amount) return "0";
  const result = walletData.get().syncProvider?.tokenSet?.formatToken(symbol, amount);
  if (result) {
    return result.endsWith(".0") ? result.substr(0, result.length - 2) : result;
  }
  return "0";
}

export default {
  parseToken,

  timeCalc: (timeInSec: number) => {
    const hours: number = Math.floor(timeInSec / 60 / 60);
    const minutes: number = Math.floor(timeInSec / 60) - hours * 60;
    const seconds: number = timeInSec - hours * 60 * 60 - minutes * 60;

    const strArr: Array<string> = [];
    if (hours) {
      strArr.push(`${hours} hours`);
    }
    if (minutes) {
      strArr.push(`${minutes} minutes`);
    }
    if (seconds) {
      strArr.push(`${seconds} seconds`);
    }

    return strArr.join(" ");
  },

  handleFormatToken,

  getFormattedTotalPrice: (price: number, amount: number) => {
    const total = price * amount;
    if (!amount || total === 0) {
      return "$0.00";
    }
    return total < 0.01 ? "<$0.01" : `~$${total.toFixed(2)}`;
  },

  /**
   * @param a
   * @param b
   * @return {number}
   */
  compareTokensById: (a: ZkInBalance, b: ZkInBalance) => {
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    }
    return 0;
  },

  /**
   * Soring by the token name
   * @param {ZkInBalance} a
   * @param {ZkInBalance} b
   * @returns {number}
   */
  sortBalancesAZ: (a: ZkInBalance, b: ZkInBalance) => {
    return a.symbol.localeCompare(b.symbol);
  },

  isAmountPackable: (amount: BigNumberish): boolean => {
    return zkUtils.isTransactionAmountPackable(amount);
  },

  validateAddress: (address: Address): boolean => {
    return utils.isAddress(address);
  },

  searchInArr: (search: string, list: Array<unknown>, searchParam: (e: unknown) => string) => {
    if (!search.trim()) {
      return list;
    }
    search = search.trim().toLowerCase();
    return list.filter((e) => String(searchParam(e)).toLowerCase().includes(search));
  },

  /**
   * Theme definition moved to the utility plugin
   * @param {IPrototype} inklineContext
   * @param {boolean} toggleTheme
   * @return {"light" | "dark"}
   */
  defineTheme(inklineContext: IPrototype, toggleTheme: boolean): "light" | "dark" {
    let mode: string | null | undefined = localStorage.getItem("colorTheme");
    if (toggleTheme) {
      mode = inklineContext.config.variant = mode === "light" ? "dark" : "light";
    }
    if (mode && ["light", "dark"].includes(mode)) {
      inklineContext.config.variant = mode === "light" ? "light" : "dark";
    }
    localStorage.setItem("colorTheme", inklineContext.config.variant);
    return inklineContext.config.variant;
  },
};
