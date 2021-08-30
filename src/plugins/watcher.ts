import { iWallet } from "@/types/lib";
import { Dispatch } from "vuex";
import { Store } from "vuex/types/index";

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
    ethWindow.ethereum?.on("disconnect", (): void => {
      if (context.app.$accessor.provider.loggedIn) {
        context!.app.$toast.global?.zkException({
          message: "Wallet disconnected",
        });
        context.app.$accessor.wallet.logout(false);
        context.$router.push("/");
      }
    });
  }
};
