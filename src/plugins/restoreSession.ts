import { Context } from "@nuxt/types";
import { zkSyncNetworkConfig } from "@matterlabs/zksync-nuxt-core/utils/config";

export default async ({ app, store, route }: Context) => {
  if (typeof route.query.network === "string" && Object.prototype.hasOwnProperty.call(zkSyncNetworkConfig, route.query.network)) {
    await store.dispatch("zk-provider/changeNetwork", route.query.network);
  }
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
