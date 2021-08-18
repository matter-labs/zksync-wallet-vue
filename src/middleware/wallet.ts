import { walletData } from "@/plugins/walletData";
import { Context, Middleware } from "@nuxt/types";

const wallet: Middleware = ({ redirect, app: { $accessor }, route }: Context) => {
  if (route.fullPath !== "/") {
    if (!walletData.get().syncWallet || !$accessor.auth.loggedIn) {
      console.log("Redirect", "/");
      redirect("/");
    }
  } else if (walletData.get().syncWallet && $accessor.auth.loggedIn) {
    console.log("Redirect", "/account");
    redirect("/account");
  }
};

export default wallet;
