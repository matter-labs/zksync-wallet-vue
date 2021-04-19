# [zkWallet v.2.3.0-beta](https://wallet.zksync.io/) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/matter-labs/zksync-wallet/blob/master/LICENSE-MIT) [![GitHub license](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/matter-labs/zksync-wallet/blob/master/LICENSE-MIT) [![npm version](https://img.shields.io/npm/v/zksync.svg?style=flat)](https://www.npmjs.com/package/zksync) [![Live on Mainnet](https://img.shields.io/badge/wallet-Live%20on%20Mainnet-blue)](https://wallet.zksync.io) [![Live on Rinkeby](https://img.shields.io/badge/wallet-Live%20on%20Rinkeby-blue)](https://rinkeby.zksync.io) [![Live on Ropsten](https://img.shields.io/badge/wallet-Live%20on%20Ropsten-blue)](https://ropsten.zksync.io) [![Join the technical discussion chat at https://gitter.im/matter-labs/zksync](https://badges.gitter.im/matter-labs/zksync.svg)](https://gitter.im/matter-labs/zksync?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


# zkWallet dApp

A completely different version of zkWallet, built with nuxt+vuejs.
New architecture, implemented open source design system. Tight roadmap with many awesome features will guide developers into the amazing world of dApps and introduce true
 reactive interaction, dialog-based UX.
 
It's working perfectly on ```mainnet```, ```rinkeby``` and ```ropsten```, published and ready for mass adoption.

> The nearest milestone for **zkWallet**  will enable **Paypal-scale** throughput for any dApp, wallet or smart
>-contract &nbsp;🚀

## Released features

✅ **[new]** Customizable allowance of the operations;

✅ **[new]** Realtime status of your pending / changing balances

✅ **[new]** Minor UI update (“face-lifting”);

✅ **[new]** Updated procedure of **Account unlock**

✅ **[new]** New transactions history supporting all done operations;

✅ ETH and ERC20 token transfers with instant confirmations and 10 min finality on L1;

✅ Zero-cost account creation, simple and universal;

✅ Payments to existing Ethereum addresses (including smart-contracts);

✅ Fees conveniently payable in token of your choice;

✅ Withdrawals to mainnet in ≤ 15 min;

✅ **Ultra-low transaction fees**

zkWallet was created to unleash the power of zkSync L2 operations and give everyone the access to L2 zkSync features on mainnet. [Learn more](https://zksync.io/)

## Build Setup

``` bash
# install dependencies && populate .env file as of RINKEBY connection (clear install)
$ yarn prepare_ci

# serve with hot reload at localhost:3000
$ yarn dev

# build for dev
$ build:stage
# afterward you'll have prepared distributive in /public folder

# build for production (only if you have firebase:auth) 
$ cli-deploy-production.sh  
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

---

## Solutions used

* [Nuxt.js](https://nuxtjs.org)
* [Vue.js](https://vuejs.org)
* [Sentry.io](https://sentry.io)
* [Onboarding.js fork](https://docs.blocknative.com/onboard)
* [Typed Vuex](https://typed-vuex.roe.dev/)
* [Nuxt TypeScript](https://typescript.nuxtjs.org/)

## License

zkWallet is distributed under the terms of both the MIT license, and the Apache License (v.2.0).

See [LICENSE-APACHE](LICENSE-APACHE), [LICENSE-MIT](LICENSE-MIT) for details.
