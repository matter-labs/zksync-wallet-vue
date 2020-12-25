import walletData from "@/plugins/walletData.js";
import handleExpNumber from "@/plugins/handleExpNumber.js";

/* function customExpHandle(x) {
  let e;
  if (Math.abs(x) < 1.0) {
    e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = "0." + new Array(e).join("0") + x.toString().substring(2);
    }
  } else {
    e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join("0");
    }
  }
  return x;
} */
const parseToken = (symbol, amount) => {
  const syncProvider = walletData.get().syncProvider;
  return syncProvider.tokenSet.parseToken(symbol, amount.toString());
};
const handleExpNum = (symbol, amount) => {
  if (!amount) {
    return "0";
  }
  if (typeof amount === "number") {
    amount = handleExpNumber(amount);
  }
  const syncProvider = walletData.get().syncProvider;
  return handleFormatToken(symbol, syncProvider.tokenSet.parseToken(symbol, amount.toString()).toString());
};
const handleFormatToken = (symbol, amount) => {
  if (!amount) return "0";
  if (typeof amount === "number") {
    amount = amount.toString();
  }
  const syncProvider = walletData.get().syncProvider;
  return syncProvider.tokenSet.formatToken(symbol, amount);
};
const getFormatedTotalPrice = (price, amount) => {
  const total = price * amount;
  if (!amount || total === 0) {
    return "$0.00";
  }
  return total < 0.01
    ? `<$0.01`
    : `~$${
        handleExpNumber(total)
          .toString()
          .match(/^-?\d+(?:\.\d{0,2})?/)[0]
      }`;
};
const validateNumber = (amount) => {
  amount = amount.toString();
  const lastCharacter = amount.substring(amount.length-1,amount.length);
  if(lastCharacter!=="0") {
    amount = handleExpNumber(+amount).toString().replace(/-/g, '');
  }
  if(amount.length<=1){return amount}
  const firstCharacter = amount.substring(0,1);
  if(amount.length===2 && firstCharacter==="0" && lastCharacter==="0") {
    return "0";
  }
  return amount;
}
export default {
  validateNumber,
  parseToken,
  handleExpNum,
  handleFormatToken,
  getFormatedTotalPrice,
};
