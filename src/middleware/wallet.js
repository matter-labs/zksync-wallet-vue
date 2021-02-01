import { walletData } from "@/plugins/walletData";

export default async (context) => {
  if (walletData.get().syncWallet) {
    if (context.route.path === "/") {
      context.redirect("/account");
    }
    return;
  }
  (async () => {
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
    } else {
      if (context.route.path === "/") {
        context.redirect("/account");
      }
    }
  })();
};
