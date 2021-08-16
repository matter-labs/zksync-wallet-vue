import { walletData } from "@/plugins/walletData";
import { iWallet } from "@/types/lib";
import { Route } from "vue-router/types";
import { Dispatch } from "vuex";
import { Store } from "vuex/types/index";
import { Address } from "zksync/build/types";

import { ethWindow } from "~/plugins/build";

const walletRefresh = function (context: Store<iWallet>) {
  context.app.$accessor.wallet.walletRefresh(false).then((refreshWalletResult: boolean): Promise<void | Route> => {
    console.log("walletRefresh called with result", refreshWalletResult);
    if (!refreshWalletResult) {
      context.app.$accessor.wallet.logout(false);
      return context.$router.push("/");
    } else {
      return context.app.$accessor.wallet.forceRefreshData();
    }
  });
};

let changeNetworkWasSet = false;
/**
 * @param dispatch
 * @param context
 * @return {Promise<void>}
 */
export const changeNetworkSet = (dispatch: Dispatch, context: Store<iWallet>) => {
  if (!changeNetworkWasSet && process.client) {
    changeNetworkWasSet = true;
    /**
     * triggered on disconnect
     */
    ethWindow.ethereum!.on("disconnect", () => {
      context!.app.$toast.global?.zkException({
        message: "Wallet disconnected",
      });
      context.app.$accessor.wallet.logout(false);
      context.$router.push("/");
    });

    /**
     * Triggered on change of the Network
     */
    ethWindow.ethereum?.on("chainChanged", (_chainId) => {
      context!.app.$toast.global?.zkException({
        message: "ETH Network change spotted",
      });
      if (!walletData.get().syncWallet) {
        context.$router.push("/");
        return;
      }
      return walletRefresh(context);
    });

    ethWindow.ethereum?.on("accountsChanged", (changedValue: Address) => {
      console.log("Account change spotted");
      const walletAddress = Array.isArray(changedValue) ? changedValue.pop() : changedValue;
      console.log("accountsChanged", walletAddress, context.app.$accessor.account.address);
      if (!context.app.$accessor.account.address) {
        console.log("undefined account");
        context.app.$accessor.wallet.walletRefresh(true);
        return;
      }
      if (context.app.$accessor.account.address === walletAddress) {
        console.log("calling wallet check");
        context.app.$accessor.wallet.walletRefresh(true);
        return;
      }
      context.app.$toast.global.zkException({ message: "Wallet account has changed. Restarting the dApp..." });
      context.app.$accessor.wallet.logout(false);

      setTimeout(() => {
        return (window.location.href = "/");
      }, 1500);
    });
  }
};
