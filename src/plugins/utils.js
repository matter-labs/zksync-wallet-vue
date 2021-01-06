import { walletData } from "@/plugins/walletData.js";

/**
 * @todo Optimize sorting
 *
 * @param a
 * @param b
 * @return {number}
 */
const sortBalancesById = (a, b) => {
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
};

const isDecimalsValid = (symbol, rawAmount, decimalsAllowed) => {
  const decimals = parseFloat(rawAmount) - parseInt(rawAmount);
  const tokenDecimals = !decimalsAllowed ? walletData.get().syncProvider.tokenSet.resolveTokenDecimals(symbol) : decimalsAllowed;
  console.log("isDecimalsValid:", rawAmount, decimals, decimals.length, tokenDecimals, decimals.toFixed(tokenDecimals));
  return decimals.toFixed(tokenDecimals) > 0;
};

const parseToken = (symbol, amount) => {
  if (typeof amount === "number") {
    const tokenDecimals = walletData.get().syncProvider.tokenSet.resolveTokenDecimals(symbol);
    console.log(symbol, amount, tokenDecimals);
    amount = amount.toFixed(tokenDecimals);
  }
  return walletData.get().syncProvider.tokenSet.parseToken(symbol, amount.toString());
};
const handleFormatToken = (symbol, amount) => {
  if (!amount || amount === "undefined") return "0";
  return walletData.get().syncProvider.tokenSet.formatToken(symbol, amount);
};
const getFormatedTotalPrice = (price, amount) => {
  const total = price * amount;
  console.log("called getFormatedTotalPrice", typeof total, total);
  if (!amount || total === 0) {
    return "$0.00";
  }
  return total < 0.01 ? `<$0.01` : `~$${total.toFixed(2)}`;
};
const validateNumber = (token, amount) => {
  parseToken(amo);
  return amount;
};

export default {
  parseToken,
  isDecimalsValid,
  timeCalc: (timeInSec) => {
    const hours = Math.floor(timeInSec / 60 / 60);
    const minutes = Math.floor(timeInSec / 60) - hours * 60;
    const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  },
  handleTimeAmount: (time, string) => `${time} ${string}${time > 1 ? "s" : ""}`,
  validateNumber,
  handleFormatToken,
  getFormatedTotalPrice,
  sortBalancesById,
};
