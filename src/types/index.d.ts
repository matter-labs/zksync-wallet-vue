/**
 * zkSync Types
 */
import { ExternalProvider, JsonRpcFetchFunc } from "@ethersproject/providers/lib/web3-provider";
import { accessorType } from "~/store";

// All interfaces, mappings and specific types
import "~/types/lib";

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

/**
 * @author Serge B. | Matter Labs
 * Shims-declaration of the [window.ethereum] (possibly undefined)
 */
declare global {
  interface Window {
    ethereum?: ExternalProvider | JsonRpcFetchFunc;
  }
}
