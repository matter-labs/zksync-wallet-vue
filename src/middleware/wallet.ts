import { walletData } from "@/plugins/walletData";
import { Context } from "@nuxt/types";

export default ({ redirect, app: { $accessor }, route }: Context) => {
  if (walletData.get().syncWallet) {
    if (route.path === "/") {
      redirect("/account");
    }
    return;
  }
  (async () => {
    // @ts-ignore
    const onboardResult = await $accessor.wallet.onboardInit();
    if (!onboardResult) {
      await $accessor.wallet.logout();
      if (route.path !== "/") {
        redirect("/");
      }
      return;
    }

    // @ts-ignore
    const refreshWallet = await $accessor.wallet.walletRefresh();
    if (!refreshWallet) {
      await $accessor.wallet.logout();
      if (route.path !== "/") {
        redirect("/");
      }
    } else if (route.path === "/") {
      redirect("/account");
    }
  })();
};
