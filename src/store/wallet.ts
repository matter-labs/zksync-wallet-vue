import { BigNumber, BigNumberish, ethers } from 'ethers';
import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { RootState } from '~/store';
import { Address, Balance, GweiBalance, Token, TokenSymbol, Transaction } from '@/plugins/types';

import Onboard from '@matterlabs/zk-wallet-onboarding';

import onboardConfig from '@/plugins/onboardConfig';
import web3Wallet from '@/plugins/web3';
import utils from '@/plugins/utils';
import watcher from '@/plugins/watcher';
import { APP_ZKSYNC_API_LINK, ETHER_NETWORK_NAME } from '@/plugins/build';

import { walletData } from '@/plugins/walletData';

interface feesInterface {
  [symbol: string]: {
    [feeSymbol: string]: {
      [type: string]: {
        [address: string]: {
          normal: GweiBalance,
          fast: GweiBalance
        }
      }
    }
  }
}

let getTransactionHistoryAgain = false;

export const state = () => ({
  onboard: false as any,
  isAccountLocked: false,
  zkTokens: {
    lastUpdated: 0 as Number,
    list: [] as Array<Balance>,
  },
  initialTokens: {
    lastUpdated: 0 as Number,
    list: [] as Array<Balance>,
  },
  tokenPrices: {} as {
    [symbol: string]: {
      lastUpdated: Number,
      price: Number
    }
  },
  transactionsHistory: {
    lastUpdated: 0 as Number,
    list: [] as Array<Transaction>,
  },
  withdrawalProcessingTime: false as (false | {
    normal: Number,
    fast: Number
  }),
  fees: {} as feesInterface,
});

export type WalletModuleState = ReturnType<typeof state>;

export const mutations: MutationTree<WalletModuleState> = {
  setAccountLockedState(state, accountState: boolean) {
    state.isAccountLocked = accountState;
  },
  setOnboard(state, obj: any) {
    state.onboard = obj;
  },
  setTokensList(state, obj: {
    lastUpdated: Number,
    list: Array<Balance>,
  }) {
    state.initialTokens = obj;
  },
  setZkTokens(state, obj: {
    lastUpdated: Number,
    list: Array<Balance>,
  }) {
    state.zkTokens = obj;
  },
  setTokenPrice(state, { symbol, obj }: {symbol: TokenSymbol, obj: {
    lastUpdated: Number,
    price: Number
  }}) {
    state.tokenPrices[symbol] = obj;
  },
  setTransactionsList(state, obj: {
    lastUpdated: Number,
    list: Array<Transaction>,
  }) {
    state.transactionsHistory = obj;
  },
  setWithdrawalProcessingTime(state, obj: {
    normal: Number,
    fast: Number
  }) {
    state.withdrawalProcessingTime = obj;
  },
  setFees(state, { symbol, feeSymbol, type, address, obj }: {
    symbol: TokenSymbol,
    feeSymbol: TokenSymbol,
    type: string,
    address: Address,
    obj: {
      normal: GweiBalance,
      fast: GweiBalance
    },
  }) {
    if (!state.fees.hasOwnProperty(symbol)) {
      state.fees[symbol] = {};
    }
    if (!state.fees[symbol].hasOwnProperty(feeSymbol)) {
      state.fees[symbol][feeSymbol] = {};
    }
    if (!state.fees[symbol][feeSymbol].hasOwnProperty(type)) {
      state.fees[symbol][feeSymbol][type] = {};
    }
    state.fees[symbol][feeSymbol][type][address] = obj as {
      normal: GweiBalance,
      fast: GweiBalance
    };
  },
  setZkBalanceStatus(state, {status, tokenSymbol}) {
    for (const item of state.zkTokens.list) {
      if (item.symbol === tokenSymbol) {
        item.status = status;
        break;
      }
    }
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

export const getters: GetterTree<WalletModuleState, RootState> = {
  isAccountLocked(state): boolean {
    return state.isAccountLocked;
  },
  getOnboard(state): any {
    return state.onboard;
  },
  getTokensList(state): {lastUpdated: Number, list: Array<Balance>} {
    return state.initialTokens;
  },
  getInitialBalances(state): Array<Balance> {
    return state.initialTokens.list;
  },
  getzkList(state): {lastUpdated: Number, list: Array<Balance>} {
    return state.zkTokens;
  },
  getzkBalances(state): Array<Balance> {
    return state.zkTokens.list;
  },
  getTransactionsHistory(state): Array<Transaction> {
    return state.transactionsHistory.list;
  },
  getTokenPrices(state): {
    [symbol: string]: {
      lastUpdated: Number,
      price: Number
    }
  } {
    return state.tokenPrices;
  },
  getTransactionsList(state): {
    lastUpdated: Number,
    list: Array<Transaction>,
  } {
    return state.transactionsHistory;
  },
  getWithdrawalProcessingTime(state): (
    false
    |
    {
      normal: Number,
      fast: Number
    }
  ) {
    return state.withdrawalProcessingTime;
  },
  getFees(state): feesInterface {
    return state.fees;
  },
  isLoggedIn(): boolean {
    return !!(walletData.get().syncWallet && walletData.get().syncWallet?.address);
  },
};

export const actions: ActionTree<WalletModuleState, RootState> = {
  /**
   * Initial call, connecting to the wallet
   * @param commit
   * @return {Promise<boolean>}
   */
  async onboard({ commit }): Promise<boolean> {
    const onboard = Onboard(onboardConfig(this));
    commit("setOnboard", onboard);
    const previouslySelectedWallet = window.localStorage.getItem("selectedWallet");
    if (!previouslySelectedWallet) {
      this.commit("account/setSelectedWallet", "");
      return false;
    } else {
      this.dispatch("toaster/info", "Found previously selected wallet.");
      this.commit("account/setSelectedWallet", previouslySelectedWallet);
    }
    return await onboard.walletSelect(previouslySelectedWallet);
  },

  /**
   * Check if the connection to the sync provider is opened and if not - restore it
   */
  async restoreProviderConnection(): Promise<void> {
    const syncProvider = walletData.get().syncProvider;
    if (syncProvider && syncProvider.transport.ws && !syncProvider.transport.ws.isOpened) {
      await syncProvider.transport.ws.open();
    }
  },

  /**
   *
   * @param commit
   * @param dispatch
   * @param getters
   * @param accountState
   * @param force
   * @return {Promise<[array]|*>}
   */
  async getzkBalances({ commit, dispatch, getters }, { accountState, force = false } = { accountState: undefined, force: false }): Promise<Array<Balance>> {
    let listCommitted = {} as {
      [token: string]: BigNumberish;
    };
    let listVerified = {} as {
      [token: string]: BigNumberish;
    };
    let tokensList = [] as Array<Balance>;
    let syncWallet = walletData.get().syncWallet;
    if (accountState) {
      listCommitted = accountState.committed.balances;
      listVerified = accountState.verified.balances;
    } else {
      const localList = getters["getzkList"];
      if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
        return localList.list;
      }
      await dispatch("restoreProviderConnection");
      let newAccountState = await syncWallet!.getAccountState();

      // @todo Left for testing purposes.
      // const testBalances = {
      //   DAI: 98.91346,
      //   ETH: 0.00697466,
      //   STORJ: 10.496,
      //   USDC: 3329.78057,
      //   USDT: 98.55857,
      // };
      // // const testBalances1 = {
      // //   BAT: 0.9,
      // //   DAI: 33543.4016421191,
      // //   ETH: 0.0028442766686,
      // //   KNC: 0.8,
      // //   USDT: 64.277,
      // // }
      // newAccountState["committed"]["balances"] = testBalances;
      // newAccountState["verified"]["balances"] = testBalances;
      // console.log(newAccountState);

      walletData.set({ accountState: newAccountState });
      listCommitted = (newAccountState?.committed.balances || {});
      listVerified = (newAccountState?.verified.balances || {});
    }
    const restrictedTokens = this.getters["tokens/getRestrictedTokens"];

    for (const tokenSymbol in listCommitted) {
      const price = await this.dispatch('tokens/getTokenPrice', tokenSymbol);
      const committedBalance = utils.handleFormatToken(tokenSymbol, listCommitted[tokenSymbol] ? listCommitted[tokenSymbol].toString() : '0');
      const verifiedBalance = utils.handleFormatToken(tokenSymbol, listVerified[tokenSymbol] ? listVerified[tokenSymbol].toString() : '0');
      tokensList.push({
        symbol: tokenSymbol,
        status: committedBalance !== verifiedBalance ? 'Pending' : 'Verified',
        balance: committedBalance,
        rawBalance: BigNumber.from(listCommitted[tokenSymbol] ? listCommitted[tokenSymbol] : '0'),
        verifiedBalance: verifiedBalance,
        tokenPrice: price,
        restricted: ((+committedBalance) <= 0 || restrictedTokens.hasOwnProperty(tokenSymbol)),
      } as Balance);
    }
    commit("setZkTokens", {
      lastUpdated: new Date().getTime(),
      list: tokensList.sort(utils.sortBalancesById),
    });
    return tokensList;
  },

  /**
   * @param dispatch
   * @param commit
   * @param getters
   * @param force
   * @return {Promise<*[]|*>}
   */
  async getInitialBalances({ dispatch, commit, getters }, force = false): Promise<Array<Token>> {
    const localList = getters["getTokensList"];

    if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
      return localList.list;
    }
    await dispatch("restoreProviderConnection");
    const syncWallet = walletData.get().syncWallet;
    const accountState = await syncWallet?.getAccountState();
    walletData.set({ accountState });
    if(!syncWallet || !accountState) {
      return localList.list;
    }
    const loadedTokens = await this.dispatch("tokens/loadTokensAndBalances");

    const loadInitialBalancesPromises = Object.keys(loadedTokens.tokens).map(async (key) => {
      const currentToken = loadedTokens.tokens[key];
      try {
        const balance = await syncWallet.getEthereumBalance(key);
        return {
          id: currentToken.id,
          address: currentToken.address,
          balance: utils.handleFormatToken(currentToken.symbol, balance ? balance.toString() : '0'),
          rawBalance: balance,
          formattedBalance: utils.handleFormatToken(currentToken.symbol, balance.toString()),
          symbol: currentToken.symbol,
        };
      } catch (error) {
        this.dispatch("toaster/error", `Error getting ${currentToken.symbol} balance`);
      }
    });
    const balancesResults = await Promise.all(loadInitialBalancesPromises).catch((err) => {
      //@todo insert sentry logging
      return [];
    });
    const balances = balancesResults.filter((token) => token && token.rawBalance.gt(0)).sort(utils.sortBalancesById) as Array<Token>;
    const balancesEmpty = balancesResults.filter((token) => token && token.rawBalance.lte(0)).sort(utils.sortBalancesById) as Array<Token>;
    balances.push(...balancesEmpty);
    commit("setTokensList", {
      lastUpdated: new Date().getTime(),
      list: balances,
    });
    return balances;
  },

  /**
   *
   * @param dispatch
   * @param commit
   * @param getters
   * @param options
   * @return {Promise<any>}
   */
  async getTransactionsHistory({ dispatch, commit, getters }, options): Promise<Array<Transaction>> {
    // @ts-ignore: Unreachable code error
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
      const fetchTransactionHistory = await this.$axios.get(`https://${APP_ZKSYNC_API_LINK}/api/v0.1/account/${syncWallet?.address()}/history/${options.offset}/25`);
      commit("setTransactionsList", {
        lastUpdated: new Date().getTime(),
        list: options.offset === 0 ? fetchTransactionHistory.data : [...localList.list, ...fetchTransactionHistory.data],
      });
      for(const tx of fetchTransactionHistory.data) {
        if(tx.hash && tx.hash.includes("sync-tx:") && !tx.verified && !tx.fail_reason) {
          this.dispatch('transaction/watchTransaction', {transactionHash: tx.hash, existingTransaction: true});
        }
      }
      return fetchTransactionHistory.data;
    } catch (error) {
      this.dispatch("toaster/error", error.message);
      // @ts-ignore: Unreachable code error
      getTransactionHistoryAgain = setTimeout(() => {
        dispatch("getTransactionsHistory", true);
      }, 15000);
      return localList.list;
    }
  },
  async getWithdrawalProcessingTime({ getters, commit }): Promise<{
    normal: Number,
    fast: Number
  }> {
    if (getters["getWithdrawalProcessingTime"]) {
      return getters["getWithdrawalProcessingTime"];
    } else {
      const withdrawTime = await this.$axios.get(`https://${APP_ZKSYNC_API_LINK}/api/v0.1/withdrawal_processing_time`);
      commit("setWithdrawalProcessingTime", withdrawTime.data);
      return withdrawTime.data;
    }
  },
  async getFees({ getters, commit, dispatch }, { address, symbol, feeSymbol, type }): Promise<{
    fast?: Number,
    normal: Number
  }> {
    const savedFees = getters["getFees"];
    if (
      savedFees &&
      savedFees.hasOwnProperty(symbol) &&
      savedFees[symbol].hasOwnProperty(feeSymbol) &&
      savedFees[symbol][feeSymbol].hasOwnProperty(type) &&
      savedFees[symbol][feeSymbol][type].hasOwnProperty(address)
    ) {
      return savedFees[symbol][feeSymbol][type][address];
    } else {
      const syncProvider = walletData.get().syncProvider;
      const syncWallet = walletData.get().syncWallet;
      await dispatch("restoreProviderConnection");
      const zksync = await walletData.zkSync();
      if (type === "withdraw") {
        if (symbol === feeSymbol) {
          const foundFeeFast = await syncProvider!.getTransactionFee("FastWithdraw", address, symbol);
          const foundFeeNormal = await syncProvider!.getTransactionFee("Withdraw", address, symbol);
          const feesObj = {
            fast: zksync.closestPackableTransactionFee(foundFeeFast.totalFee),
            normal: zksync.closestPackableTransactionFee(foundFeeNormal.totalFee),
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        } else {
          const batchWithdrawFeeFast = await syncProvider!.getTransactionsBatchFee(["FastWithdraw", "Transfer"], [address, syncWallet!.address()], feeSymbol);
          const batchWithdrawFeeNormal = await syncProvider!.getTransactionsBatchFee(["Withdraw", "Transfer"], [address, syncWallet!.address()], feeSymbol);
          const feesObj = {
            fast: zksync.closestPackableTransactionFee(batchWithdrawFeeFast),
            normal: zksync.closestPackableTransactionFee(batchWithdrawFeeNormal),
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        }
      } else {
        if (symbol === feeSymbol) {
          const foundFeeNormal = await syncProvider!.getTransactionFee("Transfer", address, symbol);
          const totalFeeValue = zksync.closestPackableTransactionFee(foundFeeNormal.totalFee);
          const feesObj = {
            normal: totalFeeValue,
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        } else {
          const batchTransferFee = await syncProvider!.getTransactionsBatchFee(["Transfer", "Transfer"], [address, syncWallet!.address()], feeSymbol);
          const feesObj = {
            normal: zksync.closestPackableTransactionFee(batchTransferFee),
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        }
      }
    }
  },
  async checkLockedState({ commit }): Promise<void> {
    const syncWallet = walletData.get().syncWallet;
    const isSigningKeySet = await syncWallet!.isSigningKeySet();
    commit('setAccountLockedState', !isSigningKeySet);
  },
  async walletRefresh({ getters, dispatch }, firstSelect = true): Promise<boolean> {
    try {
      /* dispatch("changeNetworkRemove"); */
      const onboard = getters["getOnboard"];
      this.commit("account/setLoadingHint", "followInstructions");
      let walletCheck = false;
      if (firstSelect) {
        walletCheck = await onboard.walletSelect();
        if (!walletCheck) {
          return false;
        }
        walletCheck = await onboard.walletCheck();
      } else {
        walletCheck = await onboard.walletCheck();
      }
      if (!walletCheck) {
        return false;
      }
      if (!web3Wallet.get().eth) {
        return false;
      }
      const getAccounts = await web3Wallet.get().eth.getAccounts();
      if (getAccounts.length === 0) {
        return false;
      }
      if (walletData.get().syncWallet) {
        this.commit("account/setAddress", walletData.get().syncWallet!.address());
        this.commit("account/setLoggedIn", true);
        return true;
      }

      /**
       * @type {provider}
       */
      const currentProvider = web3Wallet.get().eth.currentProvider;
      /**
       * noinspection ES6ShorthandObjectProperty
       */
      const ethWallet = new ethers.providers.Web3Provider(currentProvider).getSigner();

      const zksync = await walletData.zkSync();
      const syncProvider = await zksync.getDefaultProvider(ETHER_NETWORK_NAME/* , 'HTTP' */);
      const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

      this.commit("account/setLoadingHint", "loadingData");
      const accountState = await syncWallet.getAccountState();

      walletData.set({ syncProvider, syncWallet, accountState, ethWallet });

      await this.dispatch("tokens/loadTokensAndBalances");
      await dispatch("getzkBalances", accountState);

      await dispatch("checkLockedState");

      await watcher.changeNetworkSet(dispatch, this);

      this.commit("contacts/getContactsFromStorage");
      this.commit("account/setAddress", syncWallet.address());
      this.commit("account/setLoggedIn", true);
      return true;
    } catch (error) {
      if(!error.message.includes("User denied")) {
        //this.dispatch("toaster/error", `Refreshing state of the wallet failed... Reason: ${error.message}`);
        this.dispatch("toaster/error", error.message);
      }
      return false;
    }
  },
  async clearDataStorage({ commit }): Promise<void> {
    commit("clearDataStorage");
  },
  async forceRefreshData({ dispatch }): Promise<void> {
    await dispatch('getInitialBalances', true).catch((err) => {
      //@todo add sentry report
    });
    await dispatch('getzkBalances', { accountState: undefined, force: true }).catch((err) => {
      //@todo add sentry report
      console.log('forceRefreshData | getzkBalances error', err);
    });
    await dispatch('getTransactionsHistory', { force: true }).catch((err) => {
      //@todo add sentry report
      console.log('forceRefreshData | getTransactionsHistory error', err);
    });
  },
  async logout({ commit, getters }): Promise<void> {
    const onboard = getters["getOnboard"];
    onboard.walletReset();
    walletData.set({ syncProvider: null, syncWallet: null, accountState: null });
    localStorage.removeItem("selectedWallet");
    this.commit("account/setLoggedIn", false);
    this.commit("account/setSelectedWallet", "");
    commit("clearDataStorage");
  },
};
