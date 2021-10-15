import { walletData } from "@/plugins/walletData";
import { Context, Middleware } from "@nuxt/types";

const wallet: Middleware = ({ redirect, app: { $accessor }, route }: Context) => {
  if (walletData.get().syncWallet) {
    if (route.path === "/") {
      redirect("/account");
    }
    return;
  }
  (async () => {
    const onboardResult = await $accessor.wallet.onboardInit();
    if (!onboardResult) {
      $accessor.wallet.logout();
      if (route.path !== "/") {
        redirect("/");
      }
      return;
    }

    const refreshWallet = await $accessor.wallet.walletRefresh(true);
    if (!refreshWallet) {
      $accessor.wallet.logout();
      if (route.path !== "/") {
        redirect("/");
      }
    } else if (route.path === "/") {
      redirect("/account");
    }
  })();
};

export default wallet;
