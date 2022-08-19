/**
 * zkSync Types
 */
import { providers } from "ethers";
import { WalletLinkProvider } from "walletlink";
import { Provider } from "@rsksmart/rif-aggregation-sdk-js";
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
    // @ts-ignore
    ethereum: providers.BaseProvider | providers.ExternalProvider | providers.JsonRpcFetchFunc | WalletLinkProvider | undefined;
    syncProvider?: Provider;
  }
}
