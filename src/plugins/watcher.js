// @ts-nocheck
import { ethereum } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";

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
  //  context.$toast.global.zkException({
  //    message: "You've changes active account. Restarting the DAPP",
  //  });
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    await dispatch("logout");
    await context.$router.push("/");
    await dispatch("clearDataStorage");
  };
};

export default {
  changeNetworkHandle,
  changeAccountHandle,
  changeNetworkSet(dispatch, context) {
    if (changeNetworkWasSet === true || !process.client || !ethereum) {
      return;
    }

    changeNetworkWasSet = true;
    ethereum.on("disconnect", () => {
      console.log("disconnect!!");
      context.$toast.global.zkException({
        message: "Connection with your Wallet was lost. Restarting the DAPP",
      });
      dispatch("logout");
    });
    ethereum.on("chainChanged", changeNetworkHandle(dispatch, context));
    ethereum.on("accountsChanged", changeAccountHandle(dispatch, context));
  },
};
