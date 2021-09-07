import { walletData } from "@/plugins/walletData";
import { Context, Middleware } from "@nuxt/types";

const wallet: Middleware = ({ redirect, app: { $accessor }, route }: Context) => {
  if (route.fullPath !== "/") {
    if (!walletData.get().syncWallet || !$accessor.provider.loggedIn) {
      redirect("/");
    }
  } else if (walletData.get().syncWallet && $accessor.provider.loggedIn) {
    redirect("/account");
  }
};

export default wallet;
