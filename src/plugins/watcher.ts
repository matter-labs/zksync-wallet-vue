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
    ethWindow.ethereum?.on("disconnect", () => {
      context!.app.$toast.global?.zkException({
        message: "Wallet disconnected",
      });
      context.app.$accessor.wallet.logout(false);
      return context.$router.push("/");
    });

    ethWindow.ethereum?.on("accountsChanged", (changedValue: Address) => {
      if (context.app.$accessor.provider.loggedIn) {
        context!.app.$toast.global?.zkException({
          message: "Account switching spotted",
        });
        const walletAddress = Array.isArray(changedValue) ? changedValue.pop() : changedValue;
        if (!!context.app.$accessor.provider.address && context.app.$accessor.provider.address !== walletAddress) {
          context.app.$accessor.wallet.logout(false);
          return context.$router.push("/");
        }
      }
    });
  }
};
