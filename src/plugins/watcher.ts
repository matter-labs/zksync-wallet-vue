import { iWallet } from "@/types/lib";
import { Dispatch } from "vuex";
import { Store } from "vuex/types/index";
import { Address } from "zksync/build/types";

import { ethWindow } from "~/plugins/build";

let changeNetworkWasSet = false;

/**
 * Testing-only closure
 * @param {string} message
 */
const debugReport = (message: string): void => {
  window.$nuxt.$toast.global?.zkException({ message });
};

/**
 * @param dispatch
 * @param context
 * @return {Promise<void>}
 */
export const changeNetworkSet = (dispatch: Dispatch, context: Store<iWallet>) => {
  const provider = context.app.$accessor.provider;
  debugReport(`changeNetworkSet[init]: called: step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
  if (!changeNetworkWasSet && process.client) {
    debugReport("changeNetworkSet[init]: first call");
    changeNetworkWasSet = true;
    /**
     * triggered on disconnect
     */
    ethWindow.ethereum!.on("disconnect", () => {
      debugReport(`ethereum[disconnect]: disconnect event triggered: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
      context!.app.$toast.global?.zkException({
        message: "Wallet disconnected",
      });
      context.app.$accessor.wallet.logout(false);
      return context.$router.push("/");
    });

    ethWindow.ethereum?.on("accountsChanged", (changedValue: Address) => {
      debugReport(`ethereum[accountsChanged]: accountsChanged event triggered: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
      if (!context.app.$accessor.provider.loader) {
        context!.app.$toast.global?.zkException({
          message: "Account switching spotted",
        });
        const walletAddress = Array.isArray(changedValue) ? changedValue.pop() : changedValue;
        if (!!context.app.$accessor.provider.address && context.app.$accessor.provider.address !== walletAddress) {
          debugReport(`ethereum[accountsChanged]: condition matched: logging out event triggered: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
          context.app.$accessor.wallet.logout(false);
          debugReport(`ethereum[accountsChanged]: logged out: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())}). redirecting`);
          return context.$router.push("/");
        }
      }
    });
  }
};
