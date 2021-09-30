import { Context } from "@nuxt/types";

export default ({ redirect, store, route }: Context) => {
  if (store.getters["zk-account/loggedIn"]) {
    if (route.path === "/") {
      return redirect("/account");
    }
  } else if (route.path !== "/" && !store.getters["zk-onboard/restoringSession"]) {
    return redirect("/");
  }
};
