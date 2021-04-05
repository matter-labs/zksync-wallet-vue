import { walletData } from "@/plugins/walletData";
import { Context } from "@nuxt/types";

export default async (context: Context) => {
  if (walletData.get().syncWallet) {
    if (context.route.path === "/") {
      context.redirect("/mint");
    }
    return;
  }
  await (async () => {
    const onboardResult = await context.store.dispatch("wallet/onboard");
    if (onboardResult !== true) {
      await context.store.dispatch("wallet/logout");
      if (context.route.path !== "/") {
        context.redirect("/");
      }
      return;
    }

    const refreshWallet = await context.store.dispatch("wallet/walletRefresh");
    if (refreshWallet !== true) {
      await context.store.dispatch("wallet/logout");
      if (context.route.path !== "/") {
        context.redirect("/");
      }
    } else if (context.route.path === "/") {
      context.redirect("/mint");
    }
  })();
};
