import { walletData } from "@/plugins/walletData";
import Web3 from "web3";
import web3Wallet from "~/plugins/web3";

let changeNetworkWasSet = false;

/**
 * @todo avoid cross-colling
 * @param dispatch
 * @param context
 * @return {function(): Promise<void>}
 */
const changeNetworkHandle = (dispatch, context) => {
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    const refreshWalletResult = await dispatch("walletRefresh", false);
    if (refreshWalletResult === false) {
      await dispatch("logout");
      await context.$router.push("/");
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
  //  context.$toast.global.zkException({
  //    message: "You've changes active account. Restarting the DAPP",
  //  });
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    await context.app.$accessor.wallet.logout();
    await context.$router.push("/");
    await context.app.$accessor.wallet.clearDataStorage();
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
      if (web3Wallet.get()?.eth?.subscribe()) {
      }
      window.ethereum?.on("disconnect", (data) => {
        console.log(data);
        context.$toast.global.zkException({
          message: "Connection with your Wallet was lost. Restarting the DAPP",
        });
        context.app.$accessor.wallet.logout();
      });
      window.ethereum?.on("chainChanged", changeNetworkHandle(dispatch, context));
      window.ethereum?.on("accountsChanged", changeAccountHandle(dispatch, context));
    }
  }
};

export default {
  changeNetworkHandle,
  changeAccountHandle,
  changeNetworkSet,
};
