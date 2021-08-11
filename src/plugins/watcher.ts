import { walletData } from "@/plugins/walletData";
import { iWallet } from "@/types/lib";
import { Dispatch } from "vuex";
import { Store } from "vuex/types/index";
import { Address } from "zksync/build/types";

import { ethWindow } from "~/plugins/build";

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
        message: "Connection with your Wallet was lost. Restarting the DAPP",
      });
      context.app.$accessor.wallet.logout();
    });

    /**
     * Triggered on change of the Network
     */
    ethWindow.ethereum?.on("chainChanged", async (_chainId) => {
      console.log("chainChanged", _chainId);
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
    });

    ethWindow.ethereum?.on("accountsChanged", (walletAddress: Address) => {
      console.log("accountsChanged", walletAddress, context.app.$accessor.account.address);
      if (context.app.$accessor.account.address === walletAddress) {
        return;
      }
      context.app.$toast.global.zkException({ message: "You've changes active account. Restarting the DAPP" });
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
    });
  }
};
