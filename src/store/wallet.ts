import { ZK_API_BASE, ZK_NETWORK } from "@/plugins/build";
import onboardConfig from "@/plugins/onboardConfig";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import watcher from "@/plugins/watcher";
import web3Wallet from "@/plugins/web3";
import { BalancesList, iWalletData, ZkInBalance, ZkInFeesObj, ZkInTx, ZkInWithdrawalTime, ZKTypeDisplayBalances, ZKTypeDisplayToken } from "@/types/lib";
import { ExternalProvider } from "@ethersproject/providers";
import Onboard from "@matterlabs/zk-wallet-onboarding";
import { API } from "@matterlabs/zk-wallet-onboarding/dist/src/interfaces";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { provider } from "web3-core";
import { closestPackableTransactionFee, getDefaultProvider, Provider, Wallet } from "zksync";
import { Address, Fee, Network, TokenSymbol } from "zksync/build/types";

interface feesInterface {
  [symbol: string]: {
    [feeSymbol: string]: {
      [type: string]: {
        [address: string]: {
          lastUpdated: number;
          value: ZkInFeesObj;
        };
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
    if (!Object.prototype.hasOwnProperty.call(state.fees, symbol)) {
      state.fees[symbol] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(state.fees[symbol], feeSymbol)) {
      state.fees[symbol][feeSymbol] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(state.fees[symbol][feeSymbol], type)) {
      state.fees[symbol][feeSymbol][type] = {};
    }

    state.fees[symbol][feeSymbol][type][address] = {
      lastUpdated: new Date().getTime(),
      value: obj,
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
  isAccountLocked: (state): boolean => state.isAccountLocked,
  getOnboard: (state): API | undefined => state.onboard,
  getTokensList: (state): { lastUpdated: number; list: Array<ZkInBalance> } => state.initialTokens,
  getInitialBalances: (state): Array<ZkInBalance> => state.initialTokens.list,
  getzkList: (state): { lastUpdated: number; list: Array<ZkInBalance> } => state.zkTokens,
  getzkBalances: (state): Array<ZkInBalance> => state.zkTokens.list,
  getTransactionsHistory: (state): Array<ZkInTx> => state.transactionsHistory.list,
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
      const onboard: API = Onboard(onboardConfig(this));
      commit("setOnboard", onboard);
      const previouslySelectedWallet = window.localStorage.getItem("selectedWallet");
      if (!previouslySelectedWallet) {
        this.app.$accessor.account.setSelectedWallet("");
        return false;
      }
      this.app.$toast.show("Found previously selected wallet.");
      this.app.$accessor.account.setSelectedWallet(previouslySelectedWallet);
      return await onboard.walletSelect(previouslySelectedWallet);
    },

    /**
     * Reload zkBalances, initial balances & the history of transaction
     * @return {Promise<void>}
     */
    async forceRefreshData(): Promise<void> {
      await this.app.$accessor.wallet.requestInitialBalances(true).catch((error: unknown) => {
        this.$sentry.captureException(error);
      });
      await this.app.$accessor.wallet.requestZkBalances({ accountState: undefined, force: false }).catch((error: unknown) => {
        this.$sentry.captureException(error);
      });
      await this.app.$accessor.wallet.requestTransactionsHistory(true).catch((error: unknown) => {
        this.$sentry.captureException(error);
      });
    },

    /**
     * Check if the connection to the sync provider is opened and if not - restore it
     */
    async restoreProviderConnection(): Promise<void> {
      // will probably be used again when websocket will be implemented
      /* if (walletData.get().syncProvider!.transport !== undefined) {
       const activeProvider: Provider = await getDefaultProvider(ETHER_NETWORK_NAME, "HTTP");
       walletData.set({ syncProvider: activeProvider });
       } */
    },

    /**
     *
     * @param state
     * @param commit
     * @param getters
     * @param accountState
     * @param force
     * @return {Promise<[array]|*>}
     */
    async requestZkBalances({ state, commit, getters }, { accountState, force = false }) {
      type BalancesList = {
        [token: string]: BigNumberish;
      };
      let listCommitted: BalancesList = {};
      let listVerified: BalancesList = {};
      const tokensList: Array<ZkInBalance> = [];
      const syncWallet = walletData.get().syncWallet;
      const savedAddress = this.app.$accessor.account.address;
      if (accountState) {
        listCommitted = accountState.committed.balances;
        listVerified = accountState.verified.balances;
      } else {
        const localList = getters.getzkList;
        if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
          return localList.list;
        }
        await this.app.$accessor.wallet.restoreProviderConnection();
        const newAccountState = await syncWallet?.getAccountState();
        if (!walletData.get().accountState) {
          walletData.set({ accountState: newAccountState });
        }
        listCommitted = newAccountState?.committed.balances || {};
        listVerified = newAccountState?.verified.balances || {};
      }
      const loadedTokens = await this.app.$accessor.tokens.loadTokensAndBalances();
      for (const tokenSymbol in listCommitted) {
        (async () => {
          try {
            /* Some weird TS error when this is has no await */
            await this.app.$accessor.tokens.getTokenPrice(tokenSymbol);
          } catch (error) {
            console.log(`Failed to get ${tokenSymbol} price at requestZkBalances`, error);
          }
        })();
        if (savedAddress !== this.app.$accessor.account.address) {
          return state.zkTokens.list;
        }
        const isRestricted: boolean = await this.app.$accessor.tokens.isRestricted(tokenSymbol);
        const committedBalance = utils.handleFormatToken(tokenSymbol, listCommitted[tokenSymbol] ? listCommitted[tokenSymbol].toString() : "0");
        const verifiedBalance = utils.handleFormatToken(tokenSymbol, listVerified[tokenSymbol] ? listVerified[tokenSymbol].toString() : "0");
        tokensList.push({
          id: loadedTokens.tokens[tokenSymbol].id,
          symbol: tokenSymbol,
          status: committedBalance !== verifiedBalance ? "Pending" : "Verified",
          balance: committedBalance,
          rawBalance: BigNumber.from(listCommitted[tokenSymbol] ? listCommitted[tokenSymbol] : "0"),
          verifiedBalance,
          restricted: !committedBalance || +committedBalance <= 0 || isRestricted,
        });
      }
      commit("setZkTokens", {
        lastUpdated: new Date().getTime(),
        list: tokensList.sort(utils.sortBalancesAZ),
      });
      return tokensList;
    },

    /**
     * @param commit
     * @param getters
     * @param force
     * @return {Promise<*[]|*>}
     */
    async requestInitialBalances({ commit, getters }, force = false) {
      const savedAddress = this.app.$accessor.account.address;
      const localList = getters.getTokensList;

      if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
        return localList.list;
      }
      await this.app.$accessor.wallet.restoreProviderConnection();
      const syncWallet = walletData.get().syncWallet;
      const accountState = await syncWallet?.getAccountState();
      if (accountState !== undefined) {
        walletData.set({ accountState });
      }
      if (!syncWallet || !accountState) {
        return localList.list;
      }
      const loadedTokens = await this.app.$accessor.tokens.loadTokensAndBalances();

      const loadInitialBalancesPromises = Object.keys(loadedTokens.tokens).map(async (key: number | string): Promise<undefined | ZkInBalance> => {
        const currentToken = loadedTokens.tokens[key];
        const balance = await syncWallet.getEthereumBalance(key.toLocaleString());
        return {
          id: currentToken.id,
          address: currentToken.address,
          balance: utils.handleFormatToken(currentToken.symbol, balance ? balance.toString() : "0"),
          rawBalance: balance,
          verifiedBalance: balance.toString(),
          symbol: currentToken.symbol,
          status: "Verified",
          restricted: false,
        };
      });
      const balancesResults: (void | ZkInBalance)[] = await Promise.all(loadInitialBalancesPromises).catch((error) => {
        this.$sentry.captureException(error);
        return [];
      });
      const balances = (balancesResults.filter((token) => token && token.rawBalance.gt(0)) as ZkInBalance[]).sort(utils.compareTokensById);
      const balancesEmpty = (balancesResults.filter((token) => token && token.rawBalance.lte(0)) as ZkInBalance[]).sort(utils.sortBalancesAZ);
      balances.push(...balancesEmpty);
      if (savedAddress !== this.app.$accessor.account.address) {
        return localList.list;
      }
      commit("setTokensList", {
        lastUpdated: new Date().getTime(),
        list: balances,
      });
    },

    /**
     *
     * @param commit
     * @param getters
     * @param force
     * @param offset
     * @param options
     * @return {Promise<any>}
     */
    async requestTransactionsHistory({ commit, getters }, { force = false, offset = 0 }): Promise<ZkInTx[]> {
      clearTimeout(getTransactionHistoryAgain);
      const localList = getters.getTransactionsList;
      const savedAddress = this.app.$accessor.account.address;
      /**
       * If valid we're returning cached transaction list
       */
      if (!force && localList.lastUpdated > new Date().getTime() - 30000 && offset === 0) {
        return localList.list;
      }
      try {
        const syncWallet = walletData.get().syncWallet;
        const fetchTransactionHistory: ZkInTx[] = await this.$http.$get(`https://${ZK_API_BASE}/api/v0.1/account/${syncWallet?.address()}/history/${offset}/25`);
        if (savedAddress !== this.app.$accessor.account.address) {
          return localList.list;
        }
        commit("setTransactionsList", {
          lastUpdated: new Date().getTime(),
          list: offset === 0 ? fetchTransactionHistory : [...localList.list, ...fetchTransactionHistory],
        });
        return fetchTransactionHistory;
      } catch (error) {
        this.$sentry.captureException(error);
        this.app.$toast.global.zkException({
          message: error.message,
        });
        getTransactionHistoryAgain = setTimeout(() => {
          this.app.$accessor.wallet.requestTransactionsHistory({ force: true });
        }, 1500);
        return localList.list;
      }
    },
    async requestFees({ getters, commit }, { address, symbol, feeSymbol, type }) {
      const savedFees = getters.getFees;
      if (
        Object.prototype.hasOwnProperty.call(savedFees, symbol) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol], feeSymbol) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol], type) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol][type], address) &&
        savedFees[symbol][feeSymbol][type][address].lastUpdated > new Date().getTime() - 30000
      ) {
        return savedFees[symbol][feeSymbol][type][address].value;
      }
      const syncProvider = walletData.get().syncProvider;
      const syncWallet = walletData.get().syncWallet;
      await this.app.$accessor.wallet.restoreProviderConnection();
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
        const batchWithdrawFeeFast = await syncProvider?.getTransactionsBatchFee(["FastWithdraw", "Transfer"], [address, syncWallet?.address()], feeSymbol);
        const batchWithdrawFeeNormal = await syncProvider?.getTransactionsBatchFee(["Withdraw", "Transfer"], [address, syncWallet?.address()], feeSymbol);
        const feesObj: ZkInFeesObj = {
          fast: batchWithdrawFeeFast !== undefined ? closestPackableTransactionFee(batchWithdrawFeeFast) : undefined,
          normal: batchWithdrawFeeNormal !== undefined ? closestPackableTransactionFee(batchWithdrawFeeNormal) : undefined,
        };
        commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
        return feesObj;
      } else if (symbol === feeSymbol) {
        const foundFeeNormal = await syncProvider?.getTransactionFee("Transfer", address, symbol);
        const totalFeeValue = foundFeeNormal !== undefined ? closestPackableTransactionFee(foundFeeNormal.totalFee) : undefined;
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
      const batchTransferFee = await syncProvider?.getTransactionsBatchFee(["Transfer", "Transfer"], [address, syncWallet?.address()], feeSymbol);
      const feesObj: ZkInFeesObj = {
        normal: batchTransferFee !== undefined ? closestPackableTransactionFee(batchTransferFee) : undefined,
        fast: undefined,
      };
      commit("setFees", { symbol, feeSymbol, type, address, obj: feesObj });
      return feesObj;
    },
    async requestWithdrawalProcessingTime({ getters, commit }): Promise<ZkInWithdrawalTime> {
      if (getters.getWithdrawalProcessingTime) {
        return getters.getWithdrawalProcessingTime;
      }
      const withdrawTime: ZkInWithdrawalTime = await this.$http.$get(`https://${ZK_API_BASE}/api/v0.1/withdrawal_processing_time`);
      // @ts-ignore
      commit("setWithdrawalProcessingTime", withdrawTime);
      return withdrawTime;
    },
    async checkLockedState({ commit }): Promise<void> {
      const syncWallet = walletData.get().syncWallet;
      const accountState = walletData.get().accountState;
      const pubKeyHash = await syncWallet!.signer!.pubKeyHash();
      commit("setAccountLockedState", pubKeyHash !== accountState!.committed.pubKeyHash);
    },
    /**
     * Refreshing the wallet in case local storage keep token or signer fired event
     *
     * @param dispatch
     * @param commit
     * @param firstSelect
     * @returns {Promise<boolean>}
     */
    async walletRefresh({ dispatch, state }, firstSelect = true): Promise<boolean> {
      try {
        let walletCheck = false;
        this.app.$accessor.account.setLoadingHint("Processing...");
        if (firstSelect) {
          walletCheck = !!(await state.onboard?.walletSelect());
          if (!walletCheck) {
            return false;
          }
        }
        walletCheck = !!(await state.onboard?.walletCheck());
        if (!walletCheck) {
          return false;
        }

        if (!web3Wallet.get()?.eth) {
          return false;
        }
        const getAccounts: string[] | undefined = await web3Wallet.get()?.eth.getAccounts();
        if (!getAccounts || getAccounts.length === 0) {
          return false;
        }

        if (walletData.get().syncWallet) {
          this.app.$accessor.account.setAddress(walletData.get().syncWallet?.address() || "");
          return true;
        }
        const currentProvider: provider | undefined = web3Wallet.get()?.eth.currentProvider;
        if (!currentProvider) {
          return false;
        }
        const ethWallet: ethers.providers.JsonRpcSigner = new ethers.providers.Web3Provider(currentProvider as ExternalProvider).getSigner();
        const syncProvider: Provider = await getDefaultProvider(ZK_NETWORK as Network, "HTTP");
        if (syncProvider === undefined) {
          return false;
        }
        this.app.$accessor.account.setLoadingHint("Follow the instructions in your wallet");
        const syncWallet = await Wallet.fromEthSigner(ethWallet, syncProvider);

        this.app.$accessor.account.setLoadingHint("Getting wallet information...");
        watcher.changeNetworkSet(dispatch, this);
        const accountState = await syncWallet!.getAccountState();
        console.log("accountState", accountState);
        walletData.set(<iWalletData>{
          syncProvider,
          syncWallet,
          accountState,
        });

        await this.app.$accessor.tokens.loadTokensAndBalances();
        await this.app.$accessor.wallet.requestZkBalances({ accountState });

        await this.app.$accessor.wallet.checkLockedState();

        this.app.$accessor.account.setAddress(syncWallet.address());
        this.app.$accessor.account.setNameFromStorage();
        this.app.$accessor.account.setLoggedIn(true);
        this.app.$accessor.contacts.getContactsFromStorage();
        return true;
      } catch (error) {
        this.$sentry.captureException(error);
        if (!error.message.includes("User denied")) {
          this.app.$toast.global.zkException({
            message: `Refreshing state of the wallet failed... Reason: ${error.message}`,
          });
        }
        return false;
      }
    },

    clearDataStorage({ commit }): void {
      this.app.$accessor.account.setAddress("");
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
      clearTimeout(getTransactionHistoryAgain);
      walletData.set({ syncProvider: undefined, syncWallet: undefined, accountState: undefined });
      localStorage.removeItem("selectedWallet");
      this.app.$accessor.account.setLoggedIn(false);
      this.app.$accessor.account.setSelectedWallet("");
      this.app.$accessor.closeActiveModal();
      commit("clearDataStorage");
    },

    /**
     * Preparing ZKBalances to show up with status & pending depositing
     * @type {string}_filter
     * @return {Promise<ZKTypeDisplayToken[]>}
     */
    async displayZkBalances({ state }, _filter = ""): Promise<ZKTypeDisplayToken[]> {
      await this.app.$accessor.wallet.requestZkBalances({ accountState: undefined, force: false });
      const returnTokens: ZKTypeDisplayBalances = {};
      state.zkTokens.list.forEach((token: ZKTypeDisplayToken): void => {
        returnTokens[token.symbol] = {
          symbol: token.symbol,
          rawBalance: token.rawBalance,
          status: token.status,
        };
      });
      const activeDeposits: BalancesList = await this.app.$accessor.transaction.getActiveDeposits();
      for (const symbol in activeDeposits) {
        if (!returnTokens[symbol]) {
          returnTokens[symbol] = {
            symbol,
            rawBalance: BigNumber.from("0"),
          };
        }
        returnTokens[symbol].status = "Pending";
        returnTokens[symbol].pendingBalance = activeDeposits[symbol];
      }
      const convertedResult: ZKTypeDisplayToken[] = <ZKTypeDisplayToken[]>Object.keys(returnTokens).map((e: TokenSymbol) => returnTokens[e]);
      return _filter ? convertedResult.filter((singleBalance: ZKTypeDisplayToken): boolean => singleBalance.symbol.search(_filter?.trim()) !== -1) : convertedResult;
    },
  },
);
