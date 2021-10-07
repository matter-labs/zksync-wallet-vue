import { Context } from "@nuxt/types";

export default ({ app, store, route }: Context) => {
  if (route.path !== "/") {
    store.dispatch("zk-onboard/restoreLogin").then((connected) => {
      if (!connected) {
        app.router?.push("/");
      }
    });
  }
};
