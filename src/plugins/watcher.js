import { walletData } from "@/plugins/walletData";

let changeNetworkWasSet = false;

/**
 * @todo avoid cross-colling
 * @param dispatch
 * @param context
 * @return {function(): Promise<void>}
 */
const changeNetworkHandle = (dispatch, context) => {
  // context.$toast.info("Blockchain environment (Network) just changed");
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    const refreshWalletResult = await dispatch("walletRefresh", false);
    if (refreshWalletResult === false) {
      await context.$router.push("/");
      await dispatch("logout");
    } else {
      await dispatch("forceRefreshData");
    }
  };
};

/**
 * @todo avoid cross-colling
 * @param dispatch
 * @param context
 * @return {function(): Promise<void>}
 */
const changeAccountHandle = (dispatch, context) => {
  // context.$toast.info("Active account changed. Please re-login to used one");
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    await dispatch("logout");
    await context.$router.push("/");
    await dispatch("clearDataStorage");
  };
};

/**
 * @todo deprecated in favour of event-bus
 * @param dispatch
 * @param context
 * @return {Promise<void>}
 */
const changeNetworkSet = (dispatch, context) => {
  if (changeNetworkWasSet !== true) {
    if (process.client && window.ethereum) {
      changeNetworkWasSet = true;
      window.ethereum.on("disconnect", () => {
        dispatch("toaster/error", "Connection with your Wallet was lost. Restarting the DAPP", { root: true });
        dispatch("logout");
      });
      window.ethereum.on("chainChanged", changeNetworkHandle(dispatch, context));
      window.ethereum.on("accountsChanged", changeAccountHandle(dispatch, context));
    }
  }
};

export default {
  changeNetworkHandle,
  changeAccountHandle,
  changeNetworkSet,
};
