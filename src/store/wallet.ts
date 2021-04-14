import { APP_ZKSYNC_API_LINK, ETHER_NETWORK_NAME } from "@/plugins/build";
import onboardConfig from "@/plugins/onboardConfig";
import { iWalletData, ZkInBalance, ZkInFeesObj, ZkInTx } from "@/plugins/types";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import watcher from "@/plugins/watcher";
import { Web3Provider } from "@ethersproject/providers/lib.esm";
import { BigNumber, BigNumberish, ethers } from "ethers";
import Onboard from "@matterlabs/zk-wallet-onboarding";
import { API, Initialization } from "@matterlabs/zk-wallet-onboarding/dist/src/interfaces";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { getDefaultProvider, closestPackableTransactionFee, Provider, Wallet } from "zksync";
import { AccountState, Address, Fee, TokenSymbol } from "zksync/src/types";

interface feesInterface {
  [symbol: string]: {
    [feeSymbol: string]: {
      [type: string]: {
        [address: string]: ZkInFeesObj;
      };
    };
  };
}

let getTransactionHistoryAgain: ReturnType<typeof setTimeout>;

export declare interface iWallet {
  onboard?: API;
  isAccountLocked: boolean;
  zkTokens: { lastUpdated: number; list: Array<ZkInBalance> };
  initialTokens: { lastUpdated: number; list: Array<ZkInBalance> };
  tokenPrices: { [p: string]: { lastUpdated: number; price: number } };
  transactionsHistory: { lastUpdated: number; list: Array<ZkInTx> };
  withdrawalProcessingTime: false | { normal: number; fast: number };
  fees: feesInterface;
}

export const state = (): iWallet => ({
  onboard: undefined,
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

export type WalletModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAccountLockedState(state, accountState: boolean): void {
    state.isAccountLocked = accountState;
  },
  setOnboard(state, obj: API) {
    state.onboard = obj;
  },
  setTokensList(state, obj: { lastUpdated: number; list: ZkInBalance[] }): void {
    state.initialTokens = obj;
  },
  setZkTokens(state, obj: { lastUpdated: number; list: ZkInBalance[] }): void {
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
        lastUpdated: number;
        price: number;
      };
    },
  ): void {
    state.tokenPrices[symbol] = obj;
  },
  setTransactionsList(
    state,
    obj: {
      lastUpdated: number;
      list: Array<ZkInTx>;
    },
  ): void {
    state.transactionsHistory = obj;
  },
  setWithdrawalProcessingTime(
    state,
    obj: {
      normal: number;
      fast: number;
    },
  ): void {
    state.withdrawalProcessingTime = obj;
  },
  setFees(state, { symbol, feeSymbol, type, address, obj }: { symbol: TokenSymbol; feeSymbol: TokenSymbol; type: string; address: Address; obj: ZkInFeesObj }): void {
    state.fees[symbol][feeSymbol][type][address] = obj as ZkInFeesObj;
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
  isAccountLocked: (state): boolean => state.isAccountLocked,
  getOnboard: (state): API | undefined => state.onboard,
  getTokensList: (state): { lastUpdated: number; list: Array<ZkInBalance> } => state.initialTokens,
  getInitialBalances: (state): Array<ZkInBalance> => state.initialTokens.list,
  getzkList: (state): { lastUpdated: number; list: Array<ZkInBalance> } => state.zkTokens,
  getzkBalances: (state): Array<ZkInBalance> => state.zkTokens.list,
  getTransactionsHistory: (state): Array<ZkInTx> => state.transactionsHistory.list,
  getTokenPrices: (
    state,
  ): {
    [symbol: string]: {
      lastUpdated: number;
      price: number;
    };
  } => state.tokenPrices,
  getTransactionsList: (
    state,
  ): {
    lastUpdated: number;
    list: Array<ZkInTx>;
  } => state.transactionsHistory,
  getWithdrawalProcessingTime: (
    state,
  ):
    | false
    | {
        normal: number;
        fast: number;
      } => state.withdrawalProcessingTime,
  getFees: (state): feesInterface => state.fees,

  getSyncWallet: () => walletData.get().syncWallet,

  getProvider: () => walletData.get().syncProvider,
  getAccountState: () => walletData.get().syncProvider,
  isLoggedIn: (): boolean => !!(walletData.get().syncWallet && walletData.get().syncWallet?.address),
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
      this.app.$toasted.global.zkCancel({
        message: "Found previously selected wallet.",
      });
      this.commit("account/setSelectedWallet", previouslySelectedWallet);
      return await onboard.walletSelect(previouslySelectedWallet);
    },

    /**
     * Check if the connection to the sync provider is opened and if not - restore it
     */
    async restoreProviderConnection(): Promise<void> {
      if (walletData.get().syncProvider!.transport !== undefined) {
        const activeProvider: Provider = await getDefaultProvider(ETHER_NETWORK_NAME, "HTTP");
        walletData.setProvider(activeProvider);
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
    async requestZkBalances({ commit, dispatch, getters }, { accountState, force = false } = { accountState: undefined, force: false }): Promise<Array<ZkInBalance>> {
      let listCommitted = {} as {
        [token: string]: BigNumberish;
      };
      let listVerified = {} as {
        [token: string]: BigNumberish;
      };
      const tokensList = [] as Array<ZkInBalance>;
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
        const newAccountState: AccountState | undefined = await syncWallet?.getAccountState();
        walletData.set({ accountState: newAccountState });
        listCommitted = newAccountState?.committed.balances || {};
        listVerified = newAccountState?.verified.balances || {};
      }
      const restrictedTokens: TokenSymbol[] = this.app.$accessor.tokens.restrictedTokens;
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
          restricted: !committedBalance || +committedBalance <= 0 || restrictedTokens.includes(tokenSymbol),
        } as ZkInBalance);
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
    async requestInitialBalances({ dispatch, commit, getters }, force = false): Promise<void | Array<ZkInBalance>> {
      const localList = getters.getTokensList;

      if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
        return localList.list;
      }
      await dispatch("restoreProviderConnection");
      const syncWallet = walletData.get().syncWallet;
      const accountState: AccountState | undefined = await syncWallet?.getAccountState();
      if (accountState !== undefined) {
        walletData.set({ accountState });
      }
      if (!syncWallet || !accountState) {
        return localList.list;
      }
      const loadedTokens = await this.dispatch("tokens/loadTokensAndBalances");

      const loadInitialBalancesPromises: Promise<void | ZkInBalance>[] = Object.keys(loadedTokens.tokens).map(
        async (key: number | string): Promise<void | ZkInBalance> => {
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
            this.app.$toasted.global.zkException({
              message: `Error getting ${currentToken.symbol} balance`,
            });
          }
        },
      );
      const balancesResults: (void | ZkInBalance)[] = await Promise.all(loadInitialBalancesPromises).catch((error) => {
        this.$sentry.captureException(error);
        return [];
      });
      // @ts-ignore
      const balances = balancesResults.filter((token) => token && token.rawBalance.gt(0)).sort(utils.compareTokensById);
      // @ts-ignore
      const balancesEmpty = balancesResults.filter((token) => token && token.rawBalance.lte(0)).sort(utils.sortBalancesAZ) as Array<Balance>;
      balances.push(...balancesEmpty);
      // @ts-ignore
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
    async requestTransactionsHistory({ dispatch, commit, getters }, { force = false, offset = 0 }): Promise<Array<ZkInTx>> {
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
        this.app.$toasted.global.zkException({
          message: error.message,
        });
        getTransactionHistoryAgain = setTimeout(() => {
          dispatch("requestTransactionsHistory", { force: true });
        }, 15000);
        return localList.list;
      }
    },
    async requestFees({ getters, commit, dispatch }, { address, symbol, feeSymbol, type }): Promise<ZkInFeesObj> {
      const savedFees = getters.getFees;
      if (
        Object.prototype.hasOwnProperty.call(savedFees, symbol) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol], feeSymbol) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol], type) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol][type], address)
      ) {
        return savedFees[symbol][feeSymbol][type][address];
      }
      const syncProvider = walletData.get().syncProvider;
      const syncWallet = walletData.get().syncWallet;
      await dispatch("restoreProviderConnection");

      if (type === "withdraw") {
        if (symbol === feeSymbol) {
          const foundFeeFast: Fee = await syncProvider!.getTransactionFee("FastWithdraw", address, symbol);
          const foundFeeNormal: Fee = await syncProvider!.getTransactionFee("Withdraw", address, symbol);
          const feesObj: ZkInFeesObj = {
            fast: foundFeeFast !== undefined ? closestPackableTransactionFee(foundFeeFast.totalFee) : undefined,
            normal: foundFeeNormal !== undefined ? closestPackableTransactionFee(foundFeeNormal.totalFee) : undefined,
          };
          commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
          return feesObj;
        }
        const batchWithdrawFeeFast: BigNumber | undefined = await syncProvider?.getTransactionsBatchFee(["FastWithdraw", "Transfer"], [address, syncWallet?.address()], feeSymbol);
        const batchWithdrawFeeNormal: BigNumber | undefined = await syncProvider?.getTransactionsBatchFee(["Withdraw", "Transfer"], [address, syncWallet?.address()], feeSymbol);
        const feesObj: ZkInFeesObj = {
          fast: batchWithdrawFeeFast !== undefined ? closestPackableTransactionFee(batchWithdrawFeeFast) : undefined,
          normal: batchWithdrawFeeNormal !== undefined ? closestPackableTransactionFee(batchWithdrawFeeNormal) : undefined,
        };
        commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
        return feesObj;
      } else if (symbol === feeSymbol) {
        const foundFeeNormal: Fee | undefined = await syncProvider?.getTransactionFee("Transfer", address, symbol);
        const totalFeeValue: BigNumber | undefined = foundFeeNormal !== undefined ? closestPackableTransactionFee(foundFeeNormal.totalFee) : undefined;
        const feesObj: ZkInFeesObj = {
          normal: totalFeeValue !== undefined ? totalFeeValue : undefined,
          fast: undefined,
        };
        commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
        return feesObj;
      }

      /**
       * @todo drop ZkInFeesObj as the typed object and simplify fees to a single (normal) except withdraw
       * @type {BigNumber}
       */
      const batchTransferFee: BigNumber | undefined = await syncProvider?.getTransactionsBatchFee(["Transfer"], [address, syncWallet?.address()], feeSymbol);
      const feesObj: ZkInFeesObj = {
        normal: batchTransferFee !== undefined ? closestPackableTransactionFee(batchTransferFee) : undefined,
        fast: "",
      };
      commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
      return feesObj;
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
      commit("setWithdrawalProcessingTime", withdrawTime.data);
      return withdrawTime.data;
    },
    async checkLockedState({ commit }): Promise<void> {
      const syncWallet = walletData.get().syncWallet;
      const isSigningKeySet: boolean = await syncWallet!.isSigningKeySet();
      commit("setAccountLockedState", !isSigningKeySet);
    },
    /**
     * Refreshing the wallet in case local storage keep token or signer fired event
     *
     * @param dispatch
     * @param rootState
     * @param state
     * @param firstSelect
     * @returns {Promise<boolean>}
     */
    async walletRefresh({ dispatch, rootState, state }, firstSelect = true): Promise<boolean> {
      try {
        this.commit("account/setLoadingHint", "Follow the instructions in your wallet");
        let walletCheck = false;
        if (firstSelect) {
          walletCheck = (await state.onboard?.walletSelect()) as boolean;
          if (!walletCheck) {
            return false;
          }
        }
        walletCheck = (await state.onboard?.walletCheck()) as boolean;
        if (!walletCheck) {
          return false;
        }

        // @ts-ignore
        const web3WalletInstance: Web3Provider = new ethers.providers.Web3Provider(window?.ethereum);
        /**
         * Provider verification
         * @todo: add network validation here
         * @type {ethers.providers.Network}
         */
        const networkInfo: ethers.providers.Network = await web3WalletInstance._ready();
        if (!networkInfo || !web3WalletInstance.provider) {
          return false;
        }

        if (walletData.get().syncWallet) {
          rootState.dispatch("account/setAddress", walletData.get().syncWallet?.address());
          return true;
        }
        const ethWallet: ethers.providers.JsonRpcSigner = web3WalletInstance.getSigner();
        const syncProvider: Provider | undefined = await getDefaultProvider(ETHER_NETWORK_NAME, "HTTP");
        if (syncProvider === undefined) {
          return false;
        }
        const syncWallet: Wallet | undefined = await Wallet.fromEthSigner(ethWallet, syncProvider);
        this.commit("account/setLoadingHint", "Getting wallet information");

        // @ts-ignore
        await watcher.changeNetworkSet(dispatch, this);

        const accountState = await syncWallet?.getAccountState();

        const walletProps: iWalletData = {
          syncProvider,
          syncWallet,
          accountState,
        };

        walletData.set(walletProps);

        await this.dispatch("tokens/loadTokensAndBalances");
        await dispatch("requestZkBalances", accountState);

        await dispatch("checkLockedState");
        //        this.nuxt.$eventBus.changeNetworkSet();

        this.app.$accessor.contacts.getContactsFromStorage();
        this.commit("account/setAddress", syncWallet?.address());
        this.commit("account/setNameFromStorage");
        this.commit("account/setLoggedIn", true);
        return true;
      } catch (error) {
        this.$sentry.captureException(error);
        if (!error.message.includes("User denied")) {
          this.app.$toasted.global.zkException({
            message: `Refreshing state of the wallet failed... Reason: ${error.message}`,
          });
        }
        return false;
      }
    },

    clearDataStorage({ commit }): void {
      commit("clearDataStorage");
    },

    /**
     * Perform logout and fire a couple of events
     * @param state
     * @param commit
     * @returns {Promise<void>}
     */
    logout({ state, commit }): void {
      state.onboard?.walletReset();
      walletData.set({ syncProvider: undefined, syncWallet: undefined, accountState: undefined });
      localStorage.removeItem("selectedWallet");
      this.commit("account/setLoggedIn", false);
      this.commit("account/setSelectedWallet", "");
      commit("clearDataStorage");
    },
  },
);
