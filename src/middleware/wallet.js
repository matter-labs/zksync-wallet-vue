import { walletData } from "@/plugins/walletData.js";

/**
 * Navigation guard to restrict access for guests, restore session if any and handle redirects to home (/account) page along with account unlock
 * @param context
 * @return {Promise<any>}
 */
export default async (context) => {
  const currentPath = context.route.path;

  let loggedIn = true;

  /**
   * Handle guest state / state without connection
   */
  if (!walletData.get().syncWallet) {
    loggedIn = false;
    /**
     * if there is onboard in memory, trying to re-connect
     */
    if (context.store.getters["wallet/getOnboard"]) {
      await context.store.dispatch("toaster/message", "Trying to restore your session");
      const refreshWallet = await context.store.dispatch("wallet/walletRefresh");
      if (refreshWallet) {
        loggedIn = true;
      } else {
        context.store.dispatch("wallet/logout").then(() => {
          context.store.dispatch("toaster/error", "No active session found. Please login once again");
        });
      }
    }

    if (!loggedIn) {
      /**
       * First redirect to home if reconnect failed
       */
      if (currentPath !== "/") {
        await context.store.dispatch("toaster/error", "No active session found. Please login once again");
        return context.redirect("/");
      }

      /**
       * Trying to login
       * @type {any}
       */
      const onboardResult = await context.store.dispatch("wallet/onboard");
      if (onboardResult !== true) {
        return await context.store.dispatch("wallet/logout");
      }
      loggedIn = true;
    }
  }
  if (loggedIn) {
    if (currentPath === "/") {
      return context.redirect("/account");
    }

    /**
     * Perform redirect in case account is locked and user trying to access withdraw or transfer
     */
    if (context.store.getters["wallet/isAccountLocked"]) {
      const routesRequiredUnlock = ["withdraw", "transfer"];
      const filteredPaths = routesRequiredUnlock.filter((pattern) => {
        return currentPath.includes(pattern);
      });
      if (filteredPaths.length > 0) {
        context.redirect("/account/unlock");
      }
    }
  }
};
