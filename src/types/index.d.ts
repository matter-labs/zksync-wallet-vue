/**
 * zkSync Types
 */
import { accessorType } from "@/store";

// All interfaces, mappings and specific types
import "@/types/lib";

declare module "vue/types/vue" {
  interface Vue {
    inactive: boolean;
    $accessor: typeof accessorType;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $accessor: typeof accessorType;
  }
}
