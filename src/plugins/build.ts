type networkIDS = {
  [key: string]: number;
};

const _ETHER_NETWORK_ID_DICTIONARY: networkIDS = {
  rinkeby: 4,
  ropsten: 3,
  mainnet: 1,
};

export const GIT_REVISION = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT = GIT_REVISION ? GIT_REVISION.slice(-7) : "";

export const ETHER_NETWORK_NAME: string = process.env.APP_CURRENT_NETWORK || "";

export const ETHER_PRODUCTION = ETHER_NETWORK_NAME === "mainnet";

export const ETHER_PREFIX = ETHER_PRODUCTION ? "" : ETHER_NETWORK_NAME;
export const ETHER_PREFIX_DOT = ETHER_PREFIX + (ETHER_PRODUCTION ? "" : ".");
export const ETHER_PREFIX_MINUS = ETHER_PREFIX + (ETHER_PRODUCTION ? "" : "-");

export const ETHER_NETWORK_ID = _ETHER_NETWORK_ID_DICTIONARY.rinkeby;
export const APP_ZKSYNC_API_LINK = `${ETHER_PREFIX_MINUS}api.zksync.io`;
export const APP_ZK_SCAN = `https://${ETHER_PREFIX_DOT}zkscan.io`;
export const APP_ZKSYNC_BLOCK_EXPLORER = `${APP_ZK_SCAN}/explorer`;
export const APP_ETH_BLOCK_EXPLORER = `https://${ETHER_PREFIX_DOT}etherscan.io`;
