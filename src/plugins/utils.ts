import { walletData } from "@/plugins/walletData";
import { Address, DecimalBalance, GweiBalance, TokenSymbol } from "@/plugins/types";
import { utils as zkUtils } from "zksync";
import { BigNumberish, utils } from "ethers";

/**
 *
 * @param symbol
 * @param amount
 * @return {BigNumber|*}
 */
const parseToken = (symbol: TokenSymbol, amount: DecimalBalance | number) => {
  /**
   * skip already bignumber
   */
  if (typeof amount === "object") {
    return amount;
  }
  if (typeof amount === "number") {
    const tokenDecimals = walletData.get().syncProvider!.tokenSet.resolveTokenDecimals(symbol);
    amount = amount.toFixed(tokenDecimals);
  }
  return walletData.get().syncProvider!.tokenSet.parseToken(symbol, amount.toString());
};

const handleFormatToken = (symbol: TokenSymbol, amount: GweiBalance) => {
  if (!amount || amount === "undefined") return "0";
  return walletData.get().syncProvider!.tokenSet.formatToken(symbol, amount);
};

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

  handleTimeAmount: (time: number, string: string) => `${time} ${string}${time > 1 ? "s" : ""}`,

  handleFormatToken,

  getFormattedTotalPrice: (price: number, amount: number) => {
    const total = price * amount;
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
  sortBalancesById: (a: any, b: any) => {
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

  isAmountPackable: (amount: String): boolean => {
    return zkUtils.isTransactionAmountPackable(amount as BigNumberish);
  },

  validateAddress: (address: Address): boolean => {
    return utils.isAddress(address);
  },
};
