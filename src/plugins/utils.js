import { walletData } from "@/plugins/walletData.js";
import handleExpNumber from "@/plugins/handleExpNumber.js";

/**
 * @todo Optimize sorting
 *
 * @param a
 * @param b
 * @return {number}
 */
const sortBalancesById = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

const parseToken = (symbol, amount) => {
  if (typeof amount === "number") {
    console.log(symbol, amount);
    const tokenDecimals = walletData.get().syncProvider.tokenSet.resolveTokenDecimals(symbol);
    amount = amount.toFixed(tokenDecimals);
  }
  return walletData.get().syncProvider.tokenSet.parseToken(symbol, amount.toString());
};
const handleExpNum = (symbol, amount) => {
  if (!amount) {
    return "0";
  }
  if (typeof amount === "number") {
    amount = handleExpNumber(amount);
  }
  return handleFormatToken(symbol, parseToken(symbol, amount.toString()).toString());
};
const handleFormatToken = (symbol, amount) => {
  if (!amount) return "0";
  if (typeof amount === "number") {
    amount = handleExpNumber(amount).toString();
    amount = parseToken(symbol, amount);
  }
  if (amount === "undefined") {
    amount = "0";
  }
  return walletData.get().syncProvider.tokenSet.formatToken(symbol, amount);
};
const getFormatedTotalPrice = (price, amount) => {
  const total = price * amount;
  if (!amount || total === 0) {
    return "$0.00";
  }
  return total < 0.01 ? `<$0.01` : `~$${total.toFixed(2)}`;
};
const validateNumber = (amount) => {
  amount = amount.toString();
  const lastCharacter = amount.substring(amount.length - 1, amount.length);
  if (lastCharacter !== "0") {
    amount = handleExpNumber(+amount)
      .toString()
      .replace(/-/g, "");
  }
  if (amount.length <= 1) {
    return amount;
  }
  const firstCharacter = amount.substring(0, 1);
  if (amount.length === 2 && firstCharacter === "0" && lastCharacter === "0") {
    return "0";
  }
  return amount;
};

export default {
  parseToken,
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
  handleExpNum,
  handleFormatToken,
  getFormatedTotalPrice,
  sortBalancesById,
};
