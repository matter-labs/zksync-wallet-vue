import walletData from "@/plugins/walletData.js";
export default (symbol, amount) => {
  if (!amount) return "0";
  const syncProvider = walletData.get().syncProvider;
  if (typeof amount === "number") {
    return syncProvider.tokenSet.formatToken(symbol, amount.toString());
  }
  return syncProvider.tokenSet.formatToken(symbol, amount);
};
