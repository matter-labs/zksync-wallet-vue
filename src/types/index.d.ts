import { Route } from "vue-router";
import { accessorType } from "@/store";
import { Analytics } from "@/plugins/analytics";
import "@/types/lib";

declare module "vue/types/vue" {
  interface Vue {
    inactive: boolean;
    fromRoute: Route | null;
    $accessor: typeof accessorType;
    $analytics: Analytics;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $accessor: typeof accessorType;
    $analytics: Analytics;
  }
}
