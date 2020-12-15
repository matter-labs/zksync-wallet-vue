import walletData from "@/plugins/walletData.js";
export default (symbol, amount) => {
  if (!amount) return "0";
  const syncWallet = walletData.get().syncWallet;
  if (typeof amount === "number") {
    return syncWallet.provider?.tokenSet.formatToken(symbol, amount.toString());
  }
  return syncWallet.provider?.tokenSet.formatToken(symbol, amount);
};
