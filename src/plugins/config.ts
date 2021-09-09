import { Network as ZkSyncNetwork } from "zksync/build/types";
import { ZK_NETWORK } from "./build";
const LOCAL_STORAGE_NETWORK_CONFIG = "zkSyncNetwork";

export function getCurrentNetworkConfig(): NetworkConfigOption {
  if (process.browser) {
    const name = localStorage.getItem(LOCAL_STORAGE_NETWORK_CONFIG);
    if (name?.length) {
      const option = networkOptions.find((item) => item.name === name);
      if (option) {
        return option;
      }
    }
  }

  return networkOptions.find((item) => item.name === ZK_NETWORK)!;
}

export type NetworkConfigOption = {
  name: ZkSyncNetwork;
  title: string;
  ethNetworkName: "rinkeby" | "ropsten" | "mainnet";
  ethNetworkId: 1 | 3 | 4;

  apiHost: string;
  zkScanUrl: string;
  zkSyncBlockExplorerUrl: string;
  ethBlockExplorerUrl: string;
};

export const networkOptions: NetworkConfigOption[] = [
  {
    name: "mainnet",
    title: "Mainnet",
    ethNetworkName: "mainnet",
    ethNetworkId: 1,

    apiHost: "api.zksync.io",

    zkScanUrl: "https://zkscan.io",
    zkSyncBlockExplorerUrl: "https://zkscan.io/explorer",
    ethBlockExplorerUrl: "https://etherscan.io",
  },
  {
    name: "rinkeby",
    title: "Rinkeby",
    ethNetworkName: "rinkeby",
    ethNetworkId: 4,

    apiHost: "rinkeby-beta-api.zksync.io",

    zkScanUrl: "https://rinkeby.zkscan.io",
    zkSyncBlockExplorerUrl: "https://rinkeby.zkscan.io/explorer",
    ethBlockExplorerUrl: "https://rinkeby.etherscan.io",
  },
  {
    name: "ropsten",
    title: "Ropsten",
    ethNetworkName: "ropsten",
    ethNetworkId: 3,

    apiHost: "ropsten-beta-api.zksync.io",

    zkScanUrl: "https://ropsten.zkscan.io",
    zkSyncBlockExplorerUrl: "https://ropsten.zkscan.io/explorer",
    ethBlockExplorerUrl: "https://ropsten.etherscan.io",
  },
  {
    name: "rinkeby-beta",
    title: "Rinkeby Beta",
    ethNetworkName: "rinkeby",
    ethNetworkId: 4,

    apiHost: "rinkeby-beta-api.zksync.io",

    zkScanUrl: "https://rinkeby.zkscan.io",
    zkSyncBlockExplorerUrl: "https://rinkeby.zkscan.io/explorer",
    ethBlockExplorerUrl: "https://rinkeby.etherscan.io",
  },
  {
    name: "ropsten-beta",
    title: "Ropsten Beta",
    ethNetworkName: "ropsten",
    ethNetworkId: 3,

    apiHost: "ropsten-beta-api.zksync.io",

    zkScanUrl: "https://ropsten.zkscan.io",
    zkSyncBlockExplorerUrl: "https://ropsten.zkscan.io/explorer",
    ethBlockExplorerUrl: "https://ropsten.etherscan.io",
  },
];

export default networkOptions;
