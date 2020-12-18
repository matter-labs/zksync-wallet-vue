import Onboard from "bnc-onboard";
import { ethers } from "ethers";
import Crypto from "crypto";

import onboardConfig from "@/plugins/onboardConfig.js";
import web3Wallet from "@/plugins/web3.js";
import walletData from "@/plugins/walletData.js";
import handleFormatToken from "@/plugins/handleFormatToken.js";

let getTransactionHistoryAgain = false;

function changeNetworkHandle(dispatch, router) {
  return async () => {
    const refreshWalletResult = await dispatch("walletRefresh");
    if (refreshWalletResult === false) {
      await router.push("/");
      await dispatch("logout");
    }
  };
}

const sortBalancesById = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

export const state = () => ({
  onboard: false,
  isAccountLocked: false,
  zkTokens: {
    lastUpdated: 0,
    list: [],
  },
  initialTokens: {
    lastUpdated: 0,
    list: [],
  },
  tokenPrices: {},
  transactionsHistory: {
    lastUpdated: 0,
    list: [],
  },
  withdrawalProcessingTime: false,
  fees: {},
});

export const mutations = {
  setAccountLockedState(state, accountState) {
    state.isAccountLocked = accountState;
  },
  setOnboard(state, obj) {
    state.onboard = obj;
  },
  setTokensList(state, obj) {
    state.initialTokens = obj;
  },
  setzkTokens(state, obj) {
    state.zkTokens = obj;
  },
  setTokenPrice(state, { symbol, obj }) {
    state.tokenPrices[symbol] = obj;
  },
  setTransactionsList(state, obj) {
    state.transactionsHistory = obj;
  },
  setWithdrawalProcessingTime(state, obj) {
    state.withdrawalProcessingTime = obj;
  },
  setFees(state, { symbol, type, address, obj }) {
    if (!state.fees.hasOwnProperty(symbol)) {
      state.fees[symbol] = {};
    }
    if (!state.fees[symbol].hasOwnProperty(type)) {
      state.fees[symbol][type] = {};
    }
    state.fees[symbol][type][address] = obj;
  },
  clearDataStorage(state) {
    state.zkTokens = {
      lastUpdated: 0,
      list: [],
    };
    state.initialTokens = {
      lastUpdated: 0,
      list: [],
    };
    state.transactionsHistory = {
      lastUpdated: 0,
      list: [],
    };
    state.fees = {};
  },
};

export const getters = {
  isAccountLocked(state) {
    return state.isAccountLocked;
  },
  getOnboard(state) {
    return state.onboard;
  },
  getTokensList(state) {
    return state.initialTokens;
  },
  getzkList(state) {
    return state.zkTokens;
  },
  getTokenPrices(state) {
    return state.tokenPrices;
  },
  getTransactionsList(state) {
    return state.transactionsHistory;
  },
  getWithdrawalProcessingTime(state) {
    return state.withdrawalProcessingTime;
  },
  getFees(state) {
    return state.fees;
  },
};

export const actions = {
  async onboard({ commit }) {
    const onboard = Onboard(onboardConfig(this));
    commit("setOnboard", onboard);
    const previouslySelectedWallet = window.localStorage.getItem("selectedWallet");
    if (!previouslySelectedWallet) {
      return false;
    }
    const walletSelect = await onboard.walletSelect(previouslySelectedWallet);
    return walletSelect === true;
  },
  async loadTokens(state, { syncProvider, syncWallet, accountState }) {
    if (!syncProvider || !syncWallet) {
      return { tokens: {}, ethBalances: [], zkBalances: [], error: undefined };
    }
    const tokens = await syncProvider.getTokens();

    let error = undefined;
    const zkBalance = accountState.committed.balances;

    const balancePromises = Object.entries(tokens)
      .filter((t) => t[1].symbol)
      .map(async ([key, value]) => {
        return {
          id: value.id,
          address: value.address,
          balance: +syncWallet?.provider.tokenSet.formatToken(value.symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
          symbol: value.symbol,
        };
      });

    const ethBalances = await Promise.all(balancePromises)
      .then((res) => {
        return res.filter((token) => token);
      })
      .catch((err) => {
        error = err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
        return [];
      });

    const zkBalancePromises = Object.keys(zkBalance).map(async (key) => ({
      address: tokens[key].address,
      balance: +syncWallet?.provider.tokenSet.formatToken(tokens[key].symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
      symbol: tokens[key].symbol,
      id: tokens[key].id,
    }));

    const zkBalances = await Promise.all(zkBalancePromises).catch((err) => {
      error = err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
      return [];
    });

    return {
      tokens,
      zkBalances,
      ethBalances,
      error,
    };
  },
  async getzkBalances({ commit, dispatch, getters }, { accountState, force = false } = { accountState: undefined, force: false }) {
    let listCommited = {};
    let listVerified = {};
    let tokensList = [];
    let syncWallet = walletData.get().syncWallet;
    if (accountState) {
      listCommited = accountState.committed.balances;
      listVerified = accountState.verified.balances;
    } else {
      const localList = getters["getzkList"];
      if (force === false && localList.lastUpdated > new Date().getTime() - 120000) {
        return localList.list;
      }
      let syncProvider = walletData.get().syncProvider;
      if (!syncProvider.transport.ws.isOpened) {
        await syncProvider.transport.ws.open();
      }
      const newAccountState = await syncWallet.getAccountState();
      walletData.set({ accountState: newAccountState });
      listCommited = newAccountState.committed.balances;
      listVerified = newAccountState.verified.balances;
    }
    for (const prop in listCommited) {
      const price = await dispatch("getTokenPrice", prop);
      const commitedBalance = +handleFormatToken(prop, listCommited[prop] ? listCommited[prop] : 0);
      const verifiedBalance = +handleFormatToken(prop, listVerified[prop] ? listVerified[prop] : 0);
      tokensList.push({
        symbol: prop,
        status: commitedBalance > verifiedBalance ? "Pending" : "Verified",
        balance: commitedBalance,
        verifiedBalance: verifiedBalance,
        tokenPrice: price,
      });
    }
    commit("setzkTokens", {
      lastUpdated: new Date().getTime(),
      list: tokensList,
    });
    return tokensList;
  },
  async getTokenPrice({ commit, dispatch, getters }, symbol) {
    const localList = getters["getTokenPrices"];
    if (localList.hasOwnProperty(symbol) && localList[symbol].lastUpdated > new Date().getTime() - 3600000) {
      return localList[symbol].price;
    }
    const syncProvider = walletData.get().syncProvider;
    if (!syncProvider.transport.ws.isOpened) {
      await syncProvider.transport.ws.open();
    }
    const tokenPrice = await syncProvider.getTokenPrice(symbol);
    commit("setTokenPrice", {
      symbol: symbol,
      obj: {
        lastUpdated: new Date().getTime(),
        price: tokenPrice,
      },
    });
    return tokenPrice;
  },
  async getInitialBalances({ dispatch, commit, getters }, force = false) {
    const localList = getters["getTokensList"];
    if (force === false && localList.lastUpdated > new Date().getTime() - 120000) {
      return localList.list;
    }
    const syncProvider = walletData.get().syncProvider;
    if (!syncProvider.transport.ws.isOpened) {
      await syncProvider.transport.ws.open();
    }
    const syncWallet = walletData.get().syncWallet;
    const accountState = await syncWallet.getAccountState();
    walletData.set({ accountState });
    const loadedTokens = await dispatch("loadTokens", { syncProvider, syncWallet, accountState });
    loadedTokens.zkBalances = loadedTokens.zkBalances.sort(sortBalancesById);

    /* const handleFormatToken = (symbol, amount) => {
      if (!amount) return '0';
      if (typeof amount === 'number') {
        return syncWallet.provider?.tokenSet.formatToken(symbol, amount.toString());
      }
      return syncWallet.provider?.tokenSet.formatToken(symbol, amount);
    } */
    /* const balancePromises = Object.keys(loadedTokens.tokens).map(async key => {
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
    }); */

    const balancesResults = [];

    for (const key of Object.keys(loadedTokens.tokens)) {
      const currentToken = loadedTokens.tokens[key];
      try {
        const balance = await syncWallet.getEthereumBalance(key);
        balancesResults.push({
          id: currentToken.id,
          address: currentToken.address,
          balance: +handleFormatToken(currentToken.symbol, balance ? balance : 0),
          symbol: currentToken.symbol,
        });
      } catch (error) {
        console.log(`Error getting ${currentToken.symbol}`, error);
      }
    }

    const balances = balancesResults.filter((token) => token && token.balance > 0).sort(sortBalancesById);
    const balancesEmpty = balancesResults.filter((token) => token?.balance === 0).sort(sortBalancesById);
    balances.push(...balancesEmpty);
    commit("setTokensList", {
      lastUpdated: new Date().getTime(),
      list: balances,
    });
    return balances;
  },
  async getTransactionsHistory({ dispatch, commit, getters }, options) {
    clearTimeout(getTransactionHistoryAgain);
    const localList = getters["getTransactionsList"];
    if (!options) {
      options = {
        force: false,
        offset: 0,
      };
    } else {
      if (options.force === undefined) {
        options.force = false;
      }
      if (options.offset === undefined) {
        options.offset = 0;
      }
    }
    if (options.force === false && localList.lastUpdated > new Date().getTime() - 30000 && options.offset === 0) {
      return localList.list;
    }
    try {
      const syncWallet = walletData.get().syncWallet;
      const fetchTransactionHistory = await this.$axios.get(`https://${process.env.APP_ZKSYNC_API_LINK}/api/v0.1/account/${syncWallet.address()}/history/${options.offset}/25`);
      commit("setTransactionsList", {
        lastUpdated: new Date().getTime(),
        list: options.offset === 0 ? fetchTransactionHistory.data : [...localList.list, ...fetchTransactionHistory.data],
      });
      return fetchTransactionHistory.data;
    } catch (error) {
      console.log("getTransactionsHistory error", error);
      getTransactionHistoryAgain = setTimeout(() => {
        dispatch("getTransactionsHistory", true);
      }, 15000);
      return localList.list;
    }
  },
  async getWithdrawalProcessingTime({ getters, commit }) {
    if (getters["getWithdrawalProcessingTime"]) {
      return getters["getWithdrawalProcessingTime"];
    } else {
      const withdrawTime = await this.$axios.get(`https://${process.env.APP_ZKSYNC_API_LINK}/api/v0.1/withdrawal_processing_time`);
      commit("setWithdrawalProcessingTime", withdrawTime.data);
      return withdrawTime.data;
    }
  },
  async getFees({ getters, commit }, { address, symbol, type }) {
    const savedFees = getters["getFees"];
    if (savedFees.hasOwnProperty(symbol) && savedFees[symbol].hasOwnProperty(type) && savedFees[symbol][type].hasOwnProperty(address)) {
      return savedFees[symbol][type][address];
    } else {
      const syncProvider = walletData.get().syncProvider;
      if (!syncProvider.transport.ws.isOpened) {
        await syncProvider.transport.ws.open();
      }
      if (type === "withdraw") {
        const foundFeeFast = await syncProvider.getTransactionFee("FastWithdraw", address, symbol);
        const foundFeeNormal = await syncProvider.getTransactionFee("Withdraw", address, symbol);
        const feesObj = {
          fast: parseFloat(handleFormatToken(symbol, foundFeeFast.totalFee)),
          normal: parseFloat(handleFormatToken(symbol, foundFeeNormal.totalFee)),
        };
        commit("setFees", { symbol, type, address, obj: feesObj });
        return feesObj;
      } else {
        const foundFeeNormal = await syncProvider.getTransactionFee("Transfer", address, symbol);
        const totalFeeValue = parseFloat(handleFormatToken(symbol, foundFeeNormal.totalFee));
        const feesObj = {
          normal: totalFeeValue,
        };
        commit("setFees", { symbol, type, address, obj: feesObj });
        return feesObj;
      }
    }
  },
  async walletRefresh({ getters, commit, dispatch }) {
    try {
      dispatch("changeNetworkRemove");
      const walletCheck = await getters["getOnboard"].walletCheck();
      if (walletCheck !== true) {
        return false;
      }
      const getAccounts = await web3Wallet.get().eth.getAccounts();
      if (getAccounts.length === 0) {
        return false;
      }
      /* const ethersProvider = await getDefaultProvider(process.env.APP_CURRENT_NETWORK, {
        etherscan: process.env.APP_WS_API_ETHERSCAN_TOKEN,
      }); */
      const ethWallet = new ethers.providers.Web3Provider(web3Wallet.get().eth.currentProvider).getSigner();
      /* ethersProvider.provider = ethersProvider;
      ethersProvider.getAddress = async () => {
        return getAccounts[0];
      }
      ethersProvider.address = getAccounts[0]; */

      const zksync = await import("zksync");

      const generatedRandomSeed = Crypto.randomBytes(32);
      const syncProvider = await zksync.Provider.newWebsocketProvider(process.env.APP_WS_API);
      const signer = await zksync.Signer.fromSeed(generatedRandomSeed);
      const syncWallet = await zkSync.Wallet.fromEthSigner(
        /* {
          provider: ethersProvider,
          address: getAccounts[0],
          getAddress: async () => {
            return getAccounts[0];
          },
        }, */
        ethWallet,
        syncProvider,
        signer,
        undefined,
        {
          verificationMethod: "ECDSA",
          isSignedMsgPrefixed: true,
        },
      );
      const accountState = await syncWallet.getAccountState();
      console.log("accountState", accountState);
      walletData.set({ syncProvider, syncWallet, accountState, ethWallet });
      if (accountState && accountState.committed) {
        commit("setAccountLockedState", accountState.committed.pubKeyHash === "sync:0000000000000000000000000000000000000000");
      }

      await dispatch("getzkBalances", accountState);

      /* const maxConfirmAmount = await syncProvider.getConfirmationsForEthOpAmount();
      console.log('maxConfirmAmount',maxConfirmAmount);
      const withdrawTime = await this.$axios.get(`https://${process.env.APP_ZKSYNC_API_LINK}/api/v0.1/withdrawal_processing_time`);
      console.log('withdrawTime',withdrawTime); */

      dispatch("changeNetworkSet");
      return true;
    } catch (error) {
      console.log("Refresh error", error);
      return false;
    }
  },
  async logout({ dispatch, commit }) {
    dispatch("changeNetworkRemove");
    web3Wallet.set(false);
    walletData.set({ syncProvider: null, syncWallet: null, accountState: null });
    localStorage.removeItem("selectedWallet");
    commit("clearDataStorage");
  },
  async changeNetworkRemove({ dispatch }) {
    window.ethereum && window.ethereum.hasOwnProperty("off") ? window.ethereum.off("networkChanged", changeNetworkHandle(dispatch, this.$router)) : undefined;
  },
  async changeNetworkSet({ dispatch }) {
    window.ethereum && window.ethereum.hasOwnProperty("on") ? window.ethereum.on("networkChanged", changeNetworkHandle(dispatch, this.$router)) : undefined;
  },
};
