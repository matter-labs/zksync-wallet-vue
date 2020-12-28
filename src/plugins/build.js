const _ETHER_NETWORK_ID_DICTIONARY = {
  rinkeby: 4,
  ropsten: 3,
  mainnet: 1,
};

export const GIT_REVISION_DATE = process.env.APP_GIT_UPDATED_AT;
export const APP_VERSION = process.env.APP_GIT_VERSION;

/**
 * @deprecated
 */
console.log(`This is v.${APP_VERSION}, last commit was done at ${GIT_REVISION_DATE}`);

export const GIT_REVISION = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT = GIT_REVISION ? GIT_REVISION.slice(-7) : "";

export const ETHER_NETWORK_NAME = process.env.APP_CURRENT_NETWORK;

export const ETHER_PRODUCTION = ETHER_NETWORK_NAME === "mainnet";

console.log("production: ", ETHER_PRODUCTION);

export const ETHER_PREFIX = ETHER_PRODUCTION ? "" : ETHER_NETWORK_NAME;
export const ETHER_PREFIX_DOT = ETHER_PREFIX + (ETHER_PRODUCTION ? "" : ".");
export const ETHER_PREFIX_MINUS = ETHER_PREFIX + (ETHER_PRODUCTION ? "" : "-");

export const ETHER_NETWORK_ID = parseInt(_ETHER_NETWORK_ID_DICTIONARY[ETHER_NETWORK_NAME]);
export const APP_ZKSYNC_API_LINK = `${ETHER_PREFIX_MINUS}api.zksync.io`;
export const APP_ZK_SCAN = `https://${ETHER_PREFIX_DOT}zkscan.io`;
export const APP_ZKSYNC_BLOCK_EXPLORER = `${APP_ZK_SCAN}/explorer`;
export const APP_ETH_BLOCK_EXPLORER = `${ETHER_PREFIX_DOT}etherscan.io`;
export const APP_WS_API = `wss://${ETHER_PREFIX_DOT}api.zksync.io/jsrpc-ws`;
