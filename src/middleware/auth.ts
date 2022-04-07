import { Context, Middleware } from "@nuxt/types";

const AuthMiddleware: Middleware = ({ redirect, store, route }: Context) => {
  if (store.getters["zk-account/loggedIn"]) {
    if (route.path === "/") {
      return redirect("/account");
    }
  } else if (route.path !== "/" && !store.getters["zk-onboard/restoringSession"]) {
    return redirect("/");
  }
};

export default AuthMiddleware;
