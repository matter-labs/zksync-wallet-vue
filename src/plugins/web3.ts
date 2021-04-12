import Web3 from "web3";

let web3Wallet = <boolean | Web3>false;

export default {
  get: () => {
    return web3Wallet;
  },
  set: (obj: typeof Web3) => {
    web3Wallet = obj;
  },
};
