import { walletData } from "@/plugins/walletData";
import { iWallet } from "@/types/lib";
import { Dispatch } from "vuex";
import { Store } from "vuex/types/index";

import { ethWindow } from "~/plugins/build";

let changeNetworkWasSet = false;

/**
 * @todo avoid cross-colling
 * @param dispatch
 * @param context
 * @return {function(): Promise<void>}
 */
const changeAccountHandle = (dispatch: Dispatch, context: Store<iWallet>) => {
  context.app.$toast.global.zkException({
    message: "You've changes active account. Restarting the DAPP",
  });
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    const refreshWalletResult = await context.app.$accessor.wallet.walletRefresh(false);
    if (!refreshWalletResult) {
      await context.app.$accessor.wallet.logout();
      await context.$router.push("/");
    } else {
      await context.app.$accessor.wallet.forceRefreshData();
    }
  };
};

/**
 * @todo deprecated in favour of event-bus
 * @param dispatch
 * @param context
 * @return {Promise<void>}
 */
export const changeNetworkSet = (dispatch: Dispatch, context: Store<iWallet>) => {
  if (!changeNetworkWasSet && process.client) {
    changeNetworkWasSet = true;

    ethWindow.ethereum!.on("disconnect", async () => {
      context!.app.$toast.global?.zkException({
        message: "Connection with your Wallet was lost. Restarting the DAPP",
      });
      context.app.$accessor.wallet.logout();
    });

    ethWindow.ethereum?.on("chainChanged", async (_chainId) => {
      if (!walletData.get().syncWallet) {
        return;
      }
      const refreshWalletResult = await context.app.$accessor.wallet.walletRefresh(false);
      if (refreshWalletResult === false) {
        await context.app.$accessor.wallet.logout();
        await context.$router.push("/");
      } else {
        await context.app.$accessor.wallet.forceRefreshData();
      }
    });
    ethWindow.ethereum?.on("accountsChanged", changeAccountHandle(dispatch, context));
  }
};
