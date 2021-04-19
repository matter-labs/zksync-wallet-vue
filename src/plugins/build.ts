import { networkEthId } from "@/plugins/types";
import { Network } from "zksync/build/types";

const _ETHER_NETWORK_ID_DICTIONARY: networkEthId[] = [
  { name: "rinkeby", id: 4 },
  { name: "ropsten", id: 3 },
  { name: "mainnet", id: 1 },
];

export const GIT_REVISION: string = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT: string = GIT_REVISION ? GIT_REVISION.slice(-7) : "";

export const ETHER_NETWORK_NAME: Network = process.env.APP_CURRENT_NETWORK as Network;

export const ETHER_PRODUCTION: boolean = ETHER_NETWORK_NAME === "mainnet";

export const ETHER_PREFIX: string = ETHER_PRODUCTION ? "" : ETHER_NETWORK_NAME;
export const ETHER_PREFIX_DOT: string = ETHER_PREFIX + (ETHER_PRODUCTION ? "" : ".");
export const ETHER_PREFIX_MINUS: string = ETHER_PREFIX + (ETHER_PRODUCTION ? "" : "-");

export const ETHER_NETWORK_ID: number | undefined = _ETHER_NETWORK_ID_DICTIONARY.find((value: networkEthId): boolean => value?.name === (ETHER_NETWORK_NAME as string))?.id;
export const APP_ZKSYNC_API_LINK = `${ETHER_PREFIX_MINUS}api.zksync.io`;
export const APP_ZK_SCAN = `https://${ETHER_PREFIX_DOT}zkscan.io`;
export const APP_ZKSYNC_BLOCK_EXPLORER = `${APP_ZK_SCAN}/explorer`;
export const APP_ETH_BLOCK_EXPLORER = `https://${ETHER_PREFIX_DOT}etherscan.io`;
