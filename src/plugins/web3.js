let web3Wallet = false;

export default {
  get: () => {
    return web3Wallet;
  },
  set: (obj) => {
    web3Wallet = obj;
  },
};
