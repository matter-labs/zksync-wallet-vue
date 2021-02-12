import { walletData } from "@/plugins/walletData.js";
import { utils as zkUtils } from "zksync";

/**
 *
 * @param symbol
 * @param amount
 * @return {BigNumber|*}
 */
const parseToken = (symbol, amount) => {
  /**
   * skip already bignumber
   */
  if (typeof amount === "object") {
    console.log("parseToken double call", amount, typeof amount);
    return amount;
  }
  if (typeof amount === "number") {
    const tokenDecimals = walletData.get().syncProvider.tokenSet.resolveTokenDecimals(symbol);
    console.log(symbol, amount, tokenDecimals);
    amount = amount.toFixed(tokenDecimals);
  }
  return walletData.get().syncProvider.tokenSet.parseToken(symbol, amount.toString());
};

/**
 * Extended Number type
 * @return {number|number}
 */
Number.prototype.countDecimals = function () {
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  const slittedNum = this.toString().split(".");
  if (slittedNum[1]) return this.toString().split(".")[1].length || 0;
};

const handleFormatToken = (symbol, amount) => {
  if (!amount || amount === "undefined") return "0";
  return walletData.get().syncProvider.tokenSet.formatToken(symbol, amount);
};

export default {
  parseToken,
  /**
   * Token format validation
   * @param {string} symbol
   * @param {string} rawAmount
   * @param {Number} decimalsAllowed
   * @return {boolean}
   */
  isDecimalsValid: (symbol, rawAmount, decimalsAllowed) => {
    return rawAmount.length - 1 - parseInt(rawAmount).toString().length <= decimalsAllowed;
  },

  timeCalc: (timeInSec) => {
    const hours = Math.floor(timeInSec / 60 / 60);
    const minutes = Math.floor(timeInSec / 60) - hours * 60;
    const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

    return {
      hours,
      minutes,
      seconds,
    };
  },

  /**
   * @param {number} time
   * @param {string} string
   */
  handleTimeAmount: (time, string) => `${time} ${string}${time > 1 ? "s" : ""}`,

  handleFormatToken,

  /**
   * @param {*} price
   * @param {string} amount
   * @param {*} symbol
   */
  getFormattedTotalPrice(price, amount, symbol) {
    if (amount === null) {
      console.log("getFormattedTotalPrice", price, amount, typeof price, typeof amount);
    }
    const total = price * (amount && typeof amount.toNumber === "object" ? handleFormatToken(symbol, amount.toNumber()) : amount);
    console.log("called getFormattedTotalPrice", typeof total, total);
    if (!amount || total === 0) {
      return "$0.00";
    }
    return total < 0.01 ? `<$0.01` : `~$${total.toFixed(2)}`;
  },

  /**
   * @todo Optimize sorting
   *
   * @param a
   * @param b
   * @return {number}
   */
  sortBalancesById: (a, b) => {
    if (a.hasOwnProperty("id")) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    } else {
      return a.symbol.localeCompare(b.symbol);
    }
  },

  isAmountPackable: (amount) => {
    return zkUtils.isTransactionAmountPackable(amount);
  },
};
