import { Web3Provider } from "@ethersproject/providers";

let web3Wallet: Web3Provider | undefined;

export default {
  get: (): Web3Provider | undefined => {
    return web3Wallet;
  },
  set: (obj: Web3Provider): void => {
    web3Wallet = obj;
  },
};
