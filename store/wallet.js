import Onboard from 'bnc-onboard';
import { ethers, Wallet, getDefaultProvider } from 'ethers';
import Crypto from 'crypto';
import * as zksync from 'zksync';

import onboardConfig from '@/plugins/onboardConfig.js';
import web3Wallet from '@/plugins/web3.js';
import walletData from '@/plugins/walletData.js';

function changeNetworkHandle(dispatch, router) {
  return async () => {
    const refreshWalletResult = await dispatch('walletRefresh');
    if(refreshWalletResult===false) {
      await router.push('/');
      await dispatch('logout');
    }
  }
}

const sortBalancesById = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}

export const state = () => ({
  onboard: false,
  initialTokens: {
    lastUpdated: 0,
    list: []
  },
  transactionsHistory: {
    lastUpdated: 0,
    list: []
  },
});

export const mutations = {
  setOnboard(state, obj) {
    state.onboard = obj;
  },
  setTokensList(state, obj) {
    state.initialTokens = obj;
  },
  setTransactionsList(state, obj) {
    state.transactionsHistory = obj;
  },
}

export const getters = {
  getOnboard(state) {
    return state.onboard;
  },
  getTokensList(state) {
    return state.initialTokens;
  },
  getTransactionsList(state) {
    return state.transactionsHistory;
  },
}

export const actions = {
  async onboard({commit}) {
    const onboard = Onboard(onboardConfig(this));
    commit('setOnboard', onboard);
    const previouslySelectedWallet = window.localStorage.getItem('selectedWallet');
    if (!previouslySelectedWallet) {
      return false;
    }
    const walletSelect = await onboard.walletSelect(previouslySelectedWallet);
    if(walletSelect!==true){return false}
    return true;
  },
  async loadTokens(state, {syncProvider, syncWallet, accountState}) {
    if (!syncProvider || !syncWallet) {
      return { tokens: {}, ethBalances: [], zkBalances: [], error: undefined };
    }
    const tokens = await syncProvider.getTokens();

    let error = undefined;
    const zkBalance = accountState.committed.balances;

    const balancePromises = Object.entries(tokens)
      .filter(t => t[1].symbol)
      .map(async ([key, value]) => {
        return {
          id: value.id,
          address: value.address,
          balance: +syncWallet?.provider.tokenSet.formatToken(
            value.symbol,
            zkBalance[key] ? zkBalance[key].toString() : '0',
          ),
          symbol: value.symbol,
        };
      });

    const ethBalances = await Promise.all(balancePromises)
      .then(res => {
        const balance = res.filter(token => token);
        return balance;
      })
      .catch(err => {
        error = err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
        return [];
      });

    const zkBalancePromises = Object.keys(zkBalance)
      .map(async key => ({
        address: tokens[key].address,
        balance: +syncWallet?.provider.tokenSet.formatToken(
          tokens[key].symbol,
          zkBalance[key] ? zkBalance[key].toString() : '0',
        ),
        symbol: tokens[key].symbol,
        id: tokens[key].id,
      }));

    const zkBalances = await Promise.all(zkBalancePromises).catch(
      err => {
        error = err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
        return [];
      },
    );

    return {
      tokens,
      zkBalances,
      ethBalances,
      error,
    };  
  },
  async getInitialBalances({dispatch,commit,getters}) {
    const localList = getters['getTokensList'];
    if(localList.lastUpdated>(new Date().getTime()-120000)) {
      return localList.list;
    }
    var syncProvider = walletData.get().syncProvider;
    if(!syncProvider.transport.ws.isOpened) {
      syncProvider = await zksync.Provider.newWebsocketProvider(process.env.APP_WS_API);
    }
    walletData.set({syncProvider});
    const syncWallet = walletData.get().syncWallet;
    const accountState = walletData.get().accountState;
    const loadedTokens = await dispatch('loadTokens', {syncProvider, syncWallet, accountState});
    loadedTokens.zkBalances = loadedTokens.zkBalances.sort(sortBalancesById);

    const handleFormatToken = (symbol, amount) => {
      if (!amount) return '0';
      if (typeof amount === 'number') {
        return syncWallet.provider?.tokenSet.formatToken(symbol, amount.toString());
      }
      return syncWallet.provider?.tokenSet.formatToken(symbol, amount);
    }
    const balancePromises = Object.keys(loadedTokens.tokens).map(async key => {
      try {
        if (loadedTokens.tokens[key].symbol) {
          const balance = await syncWallet.getEthereumBalance(key);
          return {
            id: loadedTokens.tokens[key].id,
            address: loadedTokens.tokens[key].address,
            balance: +handleFormatToken(
              loadedTokens.tokens[key].symbol,
              balance ? balance : 0,
            ),
            symbol: loadedTokens.tokens[key].symbol,
          };
        }
      } catch (error) {
        return {
          id: loadedTokens.tokens[key].id,
          address: loadedTokens.tokens[key].address,
          balance: 0,
          symbol: loadedTokens.tokens[key].symbol,
        };
      }
    });
  
    const balancesResults = await Promise.all(balancePromises);
    var balances = balancesResults.filter(token => token && token.balance > 0).sort(sortBalancesById);
    const balancesEmpty = balancesResults.filter(token => token?.balance === 0).sort(sortBalancesById);
    balances.push(...balancesEmpty);
    commit('setTokensList', {
      lastUpdated: new Date().getTime(),
      list: balances,
    });
    return balances;
  },
  async getTransactionsHistory({dispatch,commit,getters}, force =false) {
    const localList = getters['getTransactionsList'];
    if(force===false && localList.lastUpdated>(new Date().getTime()-120000)) {
      return localList.list;
    }
    const syncWallet = walletData.get().syncWallet;
    const fetchTransactionHistory = await this.$axios.get(`https://${process.env.APP_ZKSYNC_API_LINK}/api/v0.1/account/${syncWallet.address()}/history/0/25`);
    commit('setTransactionsList', {
      lastUpdated: new Date().getTime(),
      list: fetchTransactionHistory.data,
    });
    return fetchTransactionHistory.data;
  },
  async walletRefresh({commit,getters,dispatch}) {
    try {
      dispatch('changeNetworkRemove');
      /* const onboard = await getters['getOnboard'];
      if(!onboard){return false} */
      const walletCheck = await getters['getOnboard'].walletCheck();
      if(walletCheck!==true){return false}
      const getAccounts = await web3Wallet.get().eth.getAccounts();
      if(getAccounts.length===0) {return false;}
      const ethersProvider = await getDefaultProvider(process.env.APP_CURRENT_NETWORK);
      const generatedRandomSeed = Crypto.randomBytes(32);
      const syncProvider = await zksync.Provider.newWebsocketProvider(process.env.APP_WS_API);
      const syncWallet = await zksync.Wallet.fromEthSigner(
        {
          provider: ethersProvider,
          address: getAccounts[0],
          getAddress: async () => {
            return getAccounts[0];
          },
        },
        syncProvider,
        zksync.Signer.fromSeed(generatedRandomSeed),
        undefined,
        {
          verificationMethod: 'ECDSA',
          isSignedMsgPrefixed: true,
        },
      );
      const accountState = await syncWallet.getAccountState();
      walletData.set({syncProvider, syncWallet, accountState});
      
      /* const maxConfirmAmount = await syncProvider.getConfirmationsForEthOpAmount();
      console.log('maxConfirmAmount',maxConfirmAmount);
      const withdrawTime = await this.$axios.get(`https://${process.env.APP_ZKSYNC_API_LINK}/api/v0.1/withdrawal_processing_time`);
      console.log('withdrawTime',withdrawTime);
      const fetchTransactionHistory = await this.$axios.get(`https://${process.env.APP_ZKSYNC_API_LINK}/api/v0.1/account/${syncWallet.address()}/history/0/25`);
      console.log('fetchTransactionHistory',fetchTransactionHistory); */
      
      dispatch('changeNetworkSet');
      return true;
    } catch (error) {
      console.log('Refresh error', error);
      return false;
    }
  },
  async logout({dispatch}) {
    dispatch('changeNetworkRemove');
    web3Wallet.set(false);
    walletData.set({syncProvider: null, syncWallet: null, accountState: null});
    localStorage.removeItem('selectedWallet');
  },
  async changeNetworkRemove({dispatch}) {
    window.ethereum.off('networkChanged', changeNetworkHandle(dispatch, this.$router));
  },
  async changeNetworkSet({dispatch}) {
    window.ethereum.on('networkChanged', changeNetworkHandle(dispatch, this.$router));
  },
}