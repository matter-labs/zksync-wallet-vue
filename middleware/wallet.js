import web3Wallet from "@/plugins/web3.js";

export default async (context) => {
  if (web3Wallet.get() !== false) {
    if (context.route.path === "/") {
      context.redirect("/account");
    }
    return;
  }
  const onboardResult = await context.store.dispatch("wallet/onboard");
  console.log("Onboard Result: ", onboardResult);
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
};
