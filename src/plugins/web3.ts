import Web3 from "web3";

let web3Wallet: Web3 | undefined;

export default {
  get: (): Web3 | undefined => {
    return web3Wallet;
  },
  set: (obj: Web3): void => {
    web3Wallet = obj;
  },
};
