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
  const provider = context.app.$accessor.provider;
  if (!changeNetworkWasSet && process.client) {
    changeNetworkWasSet = true;
    /**
     * triggered on disconnect
     */
    ethWindow.ethereum?.on("disconnect", () => {
      alert("account disconnect triggers exit");
      context!.app.$toast.global?.zkException({
        message: "Wallet disconnected",
      });
      context.app.$accessor.wallet.logout(false);
      return context.$router.push("/");
    });

    ethWindow.ethereum?.on("accountsChanged", (changedValue: Address) => {
      if (!provider.loader) {
        context!.app.$toast.global?.zkException({
          message: "Account switching spotted",
        });
        const walletAddress = Array.isArray(changedValue) ? changedValue.pop() : changedValue;
        if (!!context.app.$accessor.provider.address && context.app.$accessor.provider.address !== walletAddress) {
          alert("account change triggers exit");
          context.app.$accessor.wallet.logout(false);
          return context.$router.push("/");
        }
      }
    });
  }
};
