import { walletData } from "@/plugins/walletData";
import { Inject } from "@nuxt/types/app";
import { Web3Provider } from "@ethersproject/providers";
import { Context, Plugin } from "@nuxt/types";

import { zkEventBus } from "~/plugins/types";

declare module "@nuxt/types" {
  interface Context {
    $eventBus: zkEventBus;
  }
}

const eventBus: Plugin = (context: Context, _inject: Inject) => {
  const changeNetworkWasSet: boolean = false;

  const changeAccountHandle = function (data: any | undefined): void {
    console.log(data);
    context.app.$accessor.toaster.message("Active account changed. Please re-login to used one");
    if (!walletData.get().syncWallet) {
      return;
    }
    context.app.$accessor.wallet.logout();
    context.app.$accessor.wallet.clearDataStorage();
    context.redirect("/");
  };
  const changeNetworkHandle = async function (chainId: string): Promise<void> {
    console.log(chainId);
    if (!walletData.get().syncWallet) {
      return;
    }
    const refreshWalletResult = await context.app.$accessor.wallet.walletRefresh();
    if (refreshWalletResult) {
      await context.app.$accessor.wallet.forceRefreshData();
      return;
    }
    context.app.$accessor.wallet.logout();
    context.redirect("/");
  };
  const changeNetworkSet = function (): void {
    if (!walletData.get().syncWallet || !process.client || changeNetworkWasSet) {
      return;
    }
    // @ts-ignore
    const provider: Web3Provider | false = window.hasOwnProperty("ethereum") && window.ethereum;
    if (!provider) {
      return;
    }
    provider.on(
      "chainChanged",
      async (chainId: string): Promise<void> => {
        await changeNetworkHandle(chainId);
      },
    );
    provider.on("disconnect", (): void => {
      context.app.$toast.error("Connection with your Wallet was lost. Restarting the DAPP");
      context.app.$accessor.wallet.logout();
    });
    provider.on("accountsChanged", (data: any): void => {
      changeAccountHandle(data);
    });
  };

  context.$eventBus = {
    changeAccountHandle,
    changeNetworkSet,
    changeNetworkHandle: changeNetworkSet,
  };
};

export default eventBus;
