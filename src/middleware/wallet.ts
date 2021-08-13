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
    console.log("async run provider loader");
    walletData.syncProvider.load();
    const onboardResult = await $accessor.wallet.onboardInit();
    console.log("onboard initialized with the result:", onboardResult);
    if (!onboardResult) {
      if (route.path !== "/") {
        console.log("after logout 1");
        $accessor.wallet.logout(false);
        redirect("/");
      }
      return;
    }

    const refreshWallet = await $accessor.wallet.walletRefresh(false);
    console.log("refresh ended up with value:", refreshWallet);
    if (!refreshWallet) {
      $accessor.wallet.logout(false);
      console.log("after logout 2");
      if (route.path !== "/") {
        redirect("/");
      }
    } else if (route.path === "/") {
      redirect("/account");
    }
  })();
  console.log("middleware end");
};

export default wallet;
