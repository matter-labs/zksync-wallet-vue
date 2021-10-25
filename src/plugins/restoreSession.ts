import { Context } from "@nuxt/types";

export default async ({ app, store, route }: Context) => {
  if (route.path !== "/") {
    store.dispatch("zk-onboard/restoreLogin").then((connected) => {
      if (!connected) {
        app.router?.push("/");
      }
    });
  } else {
    await store.dispatch("zk-onboard/restoreLastNetwork");
  }
};
