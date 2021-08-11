/**
 * zkSync Types
 */
import { providers } from "ethers";
import { Provider } from "zksync";
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
    ethereum?: providers.BaseProvider;
    syncProvider?: Provider;
  }
}
