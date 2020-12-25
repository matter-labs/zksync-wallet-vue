const _ETHER_NETWORK_ID_DICTIONARY = {
  rinkeby: 4,
  ropsten: 3,
  mainnet: 1,
};

export const GIT_REVISION = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT = GIT_REVISION ? GIT_REVISION.slice(-5) : "";

export const ETHER_PRODUCTION = ETHER_NETWORK_NAME === "mainnet";
export const ETHER_PREFIX = `${ETHER_NETWORK_NAME}${ETHER_PRODUCTION ? "" : "."}`;

export const ETHER_NETWORK_NAME = process.env.APP_CURRENT_NETWORK;
export const ETHER_NETWORK_ID = _ETHER_NETWORK_ID_DICTIONARY[ETHER_NETWORK_NAME];
export const APP_ZKSYNC_API_LINK = `${ETHER_NETWORK_NAME}${ETHER_PRODUCTION ? "" : "-"}api.zksync.io`;
export const APP_ZK_SCAN = `https://${ETHER_PREFIX}zkscan.io`;
export const APP_ZKSYNC_BLOCK_EXPLORER = `${APP_ZK_SCAN}zkscan.io/explorer`;
export const APP_ETH_BLOCK_EXPLORER = `${ETHER_PREFIX}etherscan.io`;
export const APP_WS_API = `wss://${ETHER_PREFIX}api.zksync.io/jsrpc-ws`;
