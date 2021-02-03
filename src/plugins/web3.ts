let web3Wallet = false as false | any;

export default {
  get: () => {
    return web3Wallet;
  },
  set: (obj: any) => {
    web3Wallet = obj;
  },
};
