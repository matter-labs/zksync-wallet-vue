import { BigNumber, BigNumberish, ethers } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex";

import { APP_ZKSYNC_API_LINK, ETHER_NETWORK_NAME } from "@/plugins/build";
import onboardConfig from "@/plugins/onboardConfig";
import { Address, Balance, FeesObj, GweiBalance, TokenSymbol, Tx, iWalletData, Provider } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import web3Wallet from "@/plugins/web3";
import watcher from "@/plugins/watcher";
import Onboard from "@matterlabs/zk-wallet-onboarding";
import { API, Initialization } from "@matterlabs/zk-wallet-onboarding/dist/src/interfaces";
import utils from "~/plugins/utils";

interface feesInterface {
  [symbol: string]: {
    [feeSymbol: string]: {
      [type: string]: {
        [address: string]: {
          normal: GweiBalance;
          fast: GweiBalance;
        };
      };
    };
  };
}

let getTransactionHistoryAgain: ReturnType<typeof setTimeout>;

export const state = () => ({
  onboard: undefined as undefined | API,
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
      lastUpdated: Number;
      price: Number;
    };
  },
  transactionsHistory: {
    lastUpdated: 0 as Number,
    list: [] as Array<Tx>,
  },
  withdrawalProcessingTime: false as
    | false
    | {
        normal: number;
        fast: number;
      },
  fees: {} as feesInterface,
});

export type WalletModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAccountLockedState(state, accountState: boolean) {
    state.isAccountLocked = accountState;
  },
  setOnboard(state, obj: any) {
    state.onboard = obj;
  },
  setTokensList(
    state,
    obj: {
      lastUpdated: Number;
      list: Array<Balance>;
    },
  ) {
    state.initialTokens = obj;
  },
  setZkTokens(
    state,
    obj: {
      lastUpdated: Number;
      list: Array<Balance>;
    },
  ) {
    state.zkTokens = obj;
  },
  setTokenPrice(
    state,
    {
      symbol,
      obj,
    }: {
      symbol: TokenSymbol;
      obj: {
        lastUpdated: Number;
        price: Number;
      };
    },
  ) {
    state.tokenPrices[symbol] = obj;
  },
  setTransactionsList(
    state,
    obj: {
      lastUpdated: Number;
      list: Array<Tx>;
    },
  ) {
    state.transactionsHistory = obj;
  },
  setWithdrawalProcessingTime(
    state,
    obj: {
      normal: number;
      fast: number;
    },
  ) {
    state.withdrawalProcessingTime = obj;
  },
  setFees(
    state,
    {
      symbol,
      feeSymbol,
      type,
      address,
      obj,
    }: {
      symbol: TokenSymbol;
      feeSymbol: TokenSymbol;
      type: string;
      address: Address;
      obj: {
        normal: GweiBalance;
        fast: GweiBalance;
      };
    },
  ) {
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
      normal: GweiBalance;
      fast: GweiBalance;
    };
  },
  /**
   * @todo review and drop (?)
   *
   * @param state
   * @param {any} status
   * @param {any} tokenSymbol
   */
  setZkBalanceStatus(state, { status, tokenSymbol }) {
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
});

export const getters = getterTree(state, {
  isAccountLocked(state): boolean {
    return state.isAccountLocked;
  },
  getOnboard(state): API | undefined {
    return state.onboard;
  },
  getTokensList(state): { lastUpdated: Number; list: Array<Balance> } {
    return state.initialTokens;
  },
  getInitialBalances(state): Array<Balance> {
    return state.initialTokens.list;
  },
  getzkList(state): { lastUpdated: Number; list: Array<Balance> } {
    return state.zkTokens;
  },
  getzkBalances(state): Array<Balance> {
    return state.zkTokens.list;
  },
  getTransactionsHistory(state): Array<Tx> {
    return state.transactionsHistory.list;
  },
  getTokenPrices(
    state,
  ): {
    [symbol: string]: {
      lastUpdated: Number;
      price: Number;
    };
  } {
    return state.tokenPrices;
  },
  getTransactionsList(
    state,
  ): {
    lastUpdated: Number;
    list: Array<Tx>;
  } {
    return state.transactionsHistory;
  },
  getWithdrawalProcessingTime(
    state,
  ):
    | false
    | {
        normal: number;
        fast: number;
      } {
    return state.withdrawalProcessingTime;
  },
  getFees(state): feesInterface {
    return state.fees;
  },

  getSyncWallet() {
    return walletData.get().syncWallet;
  },

  getProvider() {
    return walletData.get().syncProvider;
  },
  getAccountState() {
    return walletData.get().syncProvider;
  },
  isLoggedIn(): boolean {
    return !!(walletData.get().syncWallet && walletData.get().syncWallet?.address);
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    /**
     * Initial call, connecting to the wallet
     * @param commit
     * @param rootState
     * @return {Promise<boolean>}
     */
    async onboardInit({ commit }): Promise<boolean> {
      const onboard: API = Onboard(onboardConfig(this) as Initialization);
      commit("setOnboard", onboard);
      const previouslySelectedWallet = window.localStorage.getItem("selectedWallet");
      if (!previouslySelectedWallet) {
        this.commit("account/setSelectedWallet", "");
        return false;
      }
      this.dispatch("toaster/info", "Found previously selected wallet.");
      this.commit("account/setSelectedWallet", previouslySelectedWallet);
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

    async forceRefreshData({ dispatch }): Promise<void> {
      await dispatch("requestInitialBalances", true).catch((error) => {
        this.$sentry.captureException(error);
      });
      await dispatch("requestZkBalances", { accountState: undefined, force: true }).catch((error) => {
        this.$sentry.captureException(error);
      });
      await dispatch("getTransactionsHistory", { force: true }).catch((error) => {
        dispatch("requestTransactionsHistory", { force: true }).catch((subError) => {
          this.$sentry.captureException(subError);
        });
        this.$sentry.captureException(error);
      });
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
    async requestZkBalances({ commit, dispatch, getters }, { accountState, force = false } = { accountState: undefined, force: false }): Promise<Array<Balance>> {
      let listCommitted = {} as {
        [token: string]: BigNumberish;
      };
      let listVerified = {} as {
        [token: string]: BigNumberish;
      };
      const tokensList = [] as Array<Balance>;
      const syncWallet = walletData.get().syncWallet;
      if (accountState) {
        listCommitted = accountState.committed.balances;
        listVerified = accountState.verified.balances;
      } else {
        const localList = getters.getzkList;
        if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
          return localList.list;
        }
        await dispatch("restoreProviderConnection");
        const newAccountState = await syncWallet!.getAccountState();
        walletData.set({ accountState: newAccountState });
        listCommitted = newAccountState?.committed.balances || {};
        listVerified = newAccountState?.verified.balances || {};
      }
      const restrictedTokens = this.getters["tokens/getRestrictedTokens"];
      for (const tokenSymbol in listCommitted) {
        const price = await this.dispatch("tokens/getTokenPrice", tokenSymbol);
        const committedBalance = utils.handleFormatToken(tokenSymbol, listCommitted[tokenSymbol] ? listCommitted[tokenSymbol].toString() : "0");
        const verifiedBalance = utils.handleFormatToken(tokenSymbol, listVerified[tokenSymbol] ? listVerified[tokenSymbol].toString() : "0");
        tokensList.push({
          symbol: tokenSymbol,
          status: committedBalance !== verifiedBalance ? "Pending" : "Verified",
          balance: committedBalance,
          rawBalance: BigNumber.from(listCommitted[tokenSymbol] ? listCommitted[tokenSymbol] : "0"),
          verifiedBalance,
          tokenPrice: parseFloat(price),
          restricted: +committedBalance <= 0 || restrictedTokens.hasOwnProperty(tokenSymbol),
        } as Balance);
      }
      commit("setZkTokens", {
        lastUpdated: new Date().getTime(),
        list: tokensList.sort(utils.sortBalancesAZ),
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
    async requestInitialBalances({ dispatch, commit, getters }, force = false): Promise<void | Array<Balance>> {
      const localList = getters.getTokensList;

      if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
        return localList.list;
      }
      await dispatch("restoreProviderConnection");
      const syncWallet = walletData.get().syncWallet;
      const accountState = await syncWallet?.getAccountState();
      walletData.set({ accountState });
      if (!syncWallet || !accountState) {
        return localList.list;
      }
      const loadedTokens = await this.dispatch("tokens/loadTokensAndBalances");

      const loadInitialBalancesPromises: Promise<void | Balance>[] = Object.keys(loadedTokens.tokens).map(
        async (key: number | string): Promise<void | Balance> => {
          const currentToken = loadedTokens.tokens[key];
          try {
            const balance = await syncWallet.getEthereumBalance(key.toLocaleString());
            const price = await this.dispatch("tokens/getTokenPrice", currentToken.symbol);
            return {
              address: currentToken.address,
              balance: utils.handleFormatToken(currentToken.symbol, balance ? balance.toString() : "0"),
              rawBalance: balance,
              verifiedBalance: balance.toString(),
              tokenPrice: parseFloat(price),
              symbol: currentToken.symbol,
              status: "Verified",
              restricted: false,
            };
          } catch (error) {
            this.dispatch("toaster/error", `Error getting ${currentToken.symbol} balance`);
          }
        },
      );
      const balancesResults: (void | Array<Balance>)[] | any[] = await Promise.all(loadInitialBalancesPromises).catch((error) => {
        this.$sentry.captureException(error);
        return [];
      });
      const balances = balancesResults.filter((token) => token && token.rawBalance.gt(0)).sort(utils.sortTokensById);
      const balancesEmpty = balancesResults.filter((token) => token && token.rawBalance.lte(0)).sort(utils.sortBalancesAZ) as Array<Balance>;
      balances.push(...balancesEmpty);
      commit("setTokensList", {
        lastUpdated: new Date().getTime(),
        list: balances,
      });
    },

    /**
     *
     * @param dispatch
     * @param commit
     * @param getters
     * @param force
     * @param offset
     * @param options
     * @return {Promise<any>}
     */
    async requestTransactionsHistory({ dispatch, commit, getters }, { force = false, offset = 0 }): Promise<Array<Tx>> {
      clearTimeout(getTransactionHistoryAgain);
      const localList = getters.getTransactionsList;
      /**
       * If valid we're returning cached transaction list
       */
      if (!force && localList.lastUpdated > new Date().getTime() - 30000 && offset === 0) {
        return localList.list;
      }
      try {
        const syncWallet = walletData.get().syncWallet;
        const fetchTransactionHistory = await this.$axios.get(`https://${APP_ZKSYNC_API_LINK}/api/v0.1/account/${syncWallet?.address()}/history/${offset}/25`);
        commit("setTransactionsList", {
          lastUpdated: new Date().getTime(),
          list: offset === 0 ? fetchTransactionHistory.data : [...localList.list, ...fetchTransactionHistory.data],
        });
        for (const tx of fetchTransactionHistory.data) {
          if (tx.hash && tx.hash.includes("sync-tx:") && !tx.verified && !tx.fail_reason) {
            this.dispatch("transaction/watchTransaction", { transactionHash: tx.hash, existingTransaction: true });
          }
        }
        return fetchTransactionHistory.data;
      } catch (error) {
        this.$sentry.captureException(error);
        this.dispatch("toaster/error", error.message);
        getTransactionHistoryAgain = setTimeout(() => {
          dispatch("requestTransactionsHistory", { force: true });
        }, 15000);
        return localList.list;
      }
    },
    async requestWithdrawalProcessingTime({
      getters,
      commit,
    }): Promise<{
      normal: number;
      fast: number;
    }> {
      if (getters.getWithdrawalProcessingTime) {
        return getters.getWithdrawalProcessingTime;
      }
      const withdrawTime = await this.$axios.get(`https://${APP_ZKSYNC_API_LINK}/api/v0.1/withdrawal_processing_time`);
      console.log("withdrawTime", withdrawTime);
      commit("setWithdrawalProcessingTime", withdrawTime.data);
      return withdrawTime.data;
    },
    async requestFees({ getters, commit, dispatch }, { address, symbol, feeSymbol, type }): Promise<FeesObj> {
      const savedFees = getters.getFees;
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
        } else if (symbol === feeSymbol) {
          const foundFeeNormal = await syncProvider!.getTransactionFee("Transfer", address, symbol);
          const totalFeeValue = zksync.closestPackableTransactionFee(foundFeeNormal.totalFee);
          const feesObj = {
            normal: totalFeeValue,
            fast: "",
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        } else {
          const batchTransferFee = await syncProvider!.getTransactionsBatchFee(["Transfer", "Transfer"], [address, syncWallet!.address()], feeSymbol);
          const feesObj = {
            normal: zksync.closestPackableTransactionFee(batchTransferFee),
            fast: "",
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        }
      }
    },
    async checkLockedState({ commit }): Promise<void> {
      const syncWallet = walletData.get().syncWallet;
      const isSigningKeySet = await syncWallet!.isSigningKeySet();
      commit("setAccountLockedState", !isSigningKeySet);
    },
    /**
     * Refreshing the wallet in case local storage keep token or signer fired event
     *
     * @param getters
     * @param dispatch
     * @param rootState
     * @param state
     * @param commit
     * @param firstSelect
     * @returns {Promise<boolean>}
     */
    async walletRefresh({ getters, dispatch, rootState, state, commit }, firstSelect: boolean = true): Promise<boolean> {
      try {
        this.commit("account/setLoadingHint", "Follow the instructions in your wallet");
        let walletCheck: boolean = false;
        if (firstSelect) {
          walletCheck = (await state.onboard!.walletSelect()) as boolean;
          if (!walletCheck) {
            return false;
          }
        }
        walletCheck = (await state.onboard!.walletCheck()) as boolean;
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
          rootState.dispatch("account/setAddress", walletData.get().syncWallet!.address());
          return true;
        }

        /**
         * @type {provider}
         */
        const currentProvider = web3Wallet.get().eth.currentProvider;

        const ethWallet: ethers.providers.JsonRpcSigner = new ethers.providers.Web3Provider(currentProvider).getSigner();

        const zksync = await walletData.zkSync();
        const syncProvider: Provider = await zksync.getDefaultProvider(ETHER_NETWORK_NAME, "HTTP");

        const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

        this.commit("account/setLoadingHint", "Getting wallet information");

        // @ts-ignore
        await watcher.changeNetworkSet(dispatch, this);

        const accountState = await syncWallet.getAccountState();

        const walletProps: iWalletData = {
          syncProvider,
          syncWallet,
          accountState,
          ethWallet,
        };

        walletData.set(walletProps);

        await this.dispatch("tokens/loadTokensAndBalances");
        await dispatch("requestZkBalances", accountState);

        await dispatch("checkLockedState");
        //        this.nuxt.$eventBus.changeNetworkSet();

        this.commit("contacts/getContactsFromStorage");
        this.commit("account/setAddress", syncWallet.address());
        this.commit("account/setNameFromStorage");
        this.commit("account/setLoggedIn", true);
        return true;
      } catch (error) {
        console.log("Wallet refresh error", error);
        this.$sentry.captureException(error);
        if (!error.message.includes("User denied")) {
          this.dispatch("toaster/error", `Refreshing state of the wallet failed... Reason: ${error.message}`);
          this.dispatch("toaster/error", error.message);
        }
        return false;
      }
    },

    clearDataStorage({ commit }): void {
      commit("clearDataStorage");
    },

    /**
     * Perform logout and fire a couple of events
     * @param dispatch
     * @param commit
     * @param getters
     * @returns {Promise<void>}
     */
    logout({ state, commit, getters }): void {
      state.onboard?.walletReset();
      walletData.set({ syncProvider: undefined, syncWallet: undefined, accountState: undefined });
      localStorage.removeItem("selectedWallet");
      this.commit("account/setLoggedIn", false);
      this.commit("account/setSelectedWallet", "");
      commit("clearDataStorage");
    },
  },
);
