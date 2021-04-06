/**
 * zkSync Types
 */
import { accessorType } from "@/store";
import IPrototype from "@inkline/inkline";

declare module "vue/types/vue" {
  interface Vue {
    $accessor: typeof accessorType;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $accessor: typeof accessorType;
    $inkline: typeof IPrototype;
  }
}
