import { walletData } from "@/plugins/walletData";
import { Context, Middleware } from "@nuxt/types";

const wallet: Middleware = ({ redirect, app: { $accessor }, route }: Context) => {
  console.log(route.fullPath);
  if (route.fullPath !== "/") {
    if (!walletData.get().syncWallet || !$accessor.auth.loggedIn) {
      redirect("/");
    }
  } else if (walletData.get().syncWallet && $accessor.auth.loggedIn) {
    redirect("/account");
  }
};

export default wallet;
