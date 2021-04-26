import { Provider } from "@ethersproject/providers";

let web3Wallet: Provider;

export default {
  get: () => {
    return web3Wallet;
  },
  set: (obj: Provider) => {
    web3Wallet = obj;
  },
};
