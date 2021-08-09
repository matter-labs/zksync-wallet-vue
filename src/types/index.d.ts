/**
 * zkSync Types
 */
import { BaseProvider } from "@ethersproject/providers";
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

/**
 * @author Serge B. | Matter Labs
 * Shims-declaration of the [window.ethereum] (possibly undefined)
 */
declare global {
  interface Window {
    ethereum?: BaseProvider;
    syncProvider?: Provider;
  }
}
