import { Network } from "zksync/build/types";
import { version as zkSyncVersion } from "zksync/package.json";
import { version } from "../../package.json";

export const GIT_REVISION: string = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT: string = GIT_REVISION ? GIT_REVISION.slice(-7) : "";
export const VERSION: string = version;
export const ETHER_NETWORK_NAME: Network = process.env.APP_CURRENT_NETWORK as Network;
export const ETHER_PRODUCTION: boolean = ETHER_NETWORK_NAME === "mainnet";
export const ZK_NETWORK: string = process.env.ZK_NETWORK ? process.env.ZK_NETWORK : ETHER_NETWORK_NAME;

export const ZK_LIB_VERSION: string = zkSyncVersion as string;

export const CURRENT_APP_NAME = "zkSync Wallet";

/**
 * The right way of strict-typing for the web3provider
 *  — thanks to the [global.window] with type NodeJS.Global operation with the typed window is generally possible
 *  — provider [window.ethereum] should be declared separately using shims (index.d.ts)
 *    @see /src/types/index.d.ts
 * @author: Serge B. | Matter Labs
 */
export const ethWindow: Window = global.window;
