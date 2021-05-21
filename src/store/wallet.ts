import { ZK_API_BASE, ZK_NETWORK } from "@/plugins/build";
import onboardConfig from "@/plugins/onboardConfig";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import watcher from "@/plugins/watcher";
import web3Wallet from "@/plugins/web3";
import {
  BalancesList,
  BalanceToReturn,
  iWalletData,
  TokenInfo,
  Tokens,
  ZkIFeesInterface,
  ZkInBalance,
  ZkInFeesObj,
  ZkInTx,
  ZkInWithdrawalTime,
  ZKTypeFeeOption,
} from "@/types/lib";
import { ExternalProvider } from "@ethersproject/providers";
import Onboard from "@matterlabs/zk-wallet-onboarding";
import { API } from "@matterlabs/zk-wallet-onboarding/dist/src/interfaces";
import { BigNumber, ethers } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { provider } from "web3-core";
import { closestPackableTransactionFee, getDefaultProvider, Provider, Wallet } from "zksync";
import { Address, Fee, Network, PubKeyHash, TokenSymbol } from "zksync/build/types";
import { AccountState } from "zksync/src/types";

let getTransactionHistoryAgain: ReturnType<typeof setTimeout>;

export declare interface iWallet {
  onboard?: API;
  isAccountLocked: boolean;
  zkTokens: { lastUpdated: number; list: ZkInBalance[] };
  initialTokens: { lastUpdated: number; list: ZkInBalance[] };
  transactionsHistory: { lastUpdated: number; list: ZkInTx[] };
  withdrawalProcessingTime?: ZkInWithdrawalTime;
  fees: ZkIFeesInterface;
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
  withdrawalProcessingTime: undefined,
  fees: {},
});

export type WalletModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAccountLockedState(state, accountState: boolean): void {
    state.isAccountLocked = accountState;
  },
  setOnboard(state, obj: API): void {
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
      list: ZkInTx[];
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

  /**
   * @todo re-write access to the cached fees
   *
   * @param state
   * @param {string} symbol
   * @param {string} feeSymbol
   * @param {ZKTypeFeeOption} type
   * @param {string} address
   * @param {ZkInFeesObj} obj
   */
  setFees(state, { symbol, feeSymbol, type, address, obj }: { symbol: TokenSymbol; feeSymbol: TokenSymbol; type: ZKTypeFeeOption; address: Address; obj: ZkInFeesObj }): void {
    const savedFees: ZkIFeesInterface = state.fees;
    if (!Object.prototype.hasOwnProperty.call(savedFees, symbol)) {
      savedFees[symbol] = {};
    }
    if (!Object.prototype.hasOwnProperty.call(savedFees[symbol], feeSymbol)) {
      savedFees[symbol][feeSymbol] = {};
    }

    if (!Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol], type)) {
      savedFees[symbol][feeSymbol][type] = {};
    }

    savedFees[symbol][feeSymbol][type][address] = {
      lastUpdated: new Date().getTime(),
      value: obj,
    };
    state.fees = savedFees;
  },
  /**
   * @todo review and drop (?)
   *
   * @param state
   * @param status
   * @param tokenSymbol
   */
  // eslint-disable-next-line no-use-before-define
  setZkBalanceStatus(state: WalletModuleState, { status, tokenSymbol }): void {
    for (const item of state.zkTokens.list) {
      if (item.symbol === tokenSymbol) {
        item.status = status;
        break;
      }
    }
  },
  clearDataStorage(state): void {
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
  getTransactionsList: (state): { lastUpdated: number; list: Array<ZkInTx> } => state.transactionsHistory,
  getWithdrawalProcessingTime: (state): ZkInWithdrawalTime | undefined => state.withdrawalProcessingTime,
  getFees: (state): ZkIFeesInterface => state.fees,

  getSyncWallet: (): Wallet | undefined => walletData.get().syncWallet,

  getProvider: (): Provider | undefined => walletData.get().syncProvider,
  getAccountState: (): Provider | undefined => walletData.get().syncProvider,
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
      await this.app.$accessor.wallet.requestInitialBalances(true).catch((error: unknown): void => {
        console.error(error);
      });
      await this.app.$accessor.wallet.requestZkBalances({}).catch((error: unknown): void => {
        console.error(error);
      });
      await this.app.$accessor.wallet.requestTransactionsHistory({ force: true }).catch((error: unknown) => {
        console.error(error);
      });
    },

    /**
     *
     * @param state
     * @param commit
     * @param getters
     * @param accountState
     * @param force
     * @return {Promise<ZkInBalance[]>}
     */
    async requestZkBalances(
      { state, commit, getters },
      {
        accountState = undefined,
        force = false,
      }: {
        accountState?: AccountState;
        force?: boolean;
      },
    ): Promise<ZkInBalance[]> {
      let listCommitted: BalancesList = <BalancesList>{};
      let listVerified: BalancesList = <BalancesList>{};
      const tokensList: ZkInBalance[] = <ZkInBalance[]>[];
      const syncWallet: Wallet | undefined = walletData.get().syncWallet;
      const savedAddress = this.app.$accessor.account.address;
      if (accountState) {
        listCommitted = accountState.committed.balances;
        listVerified = accountState.verified.balances;
      } else {
        const localList = getters.getzkList;
        if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
          return localList.list;
        }
        const newAccountState: AccountState | undefined = await syncWallet?.getAccountState();
        if (!walletData.get().accountState) {
          walletData.set({ accountState: newAccountState });
        }
        listCommitted = newAccountState?.committed.balances || {};
        listVerified = newAccountState?.verified.balances || {};
      }
      const loadedTokens: { zkBalances: BalanceToReturn[]; tokens: Tokens } = await this.app.$accessor.tokens.loadTokensAndBalances();
      for (const tokenSymbol in listCommitted) {
        const isRestricted: boolean = await this.app.$accessor.tokens.isRestricted(tokenSymbol);
        if (!isRestricted) {
          ((): void => {
            try {
              /* Some weird TS error when this is has no await */
              this.app.$accessor.tokens.getTokenPrice(tokenSymbol);
            } catch (error) {
              console.log(`Failed to get ${tokenSymbol} price at requestZkBalances`, error);
            }
          })();
        }
        if (savedAddress !== this.app.$accessor.account.address) {
          return state.zkTokens.list;
        }
        const committedBalance = utils.handleFormatToken(tokenSymbol, listCommitted[tokenSymbol] ? listCommitted[tokenSymbol].toString() : "0");
        const verifiedBalance = utils.handleFormatToken(tokenSymbol, listVerified[tokenSymbol] ? listVerified[tokenSymbol].toString() : "0");
        tokensList.push({
          id: loadedTokens?.tokens[tokenSymbol]?.id,
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
     * @return {Promise<ZkInBalance[]>}
     */
    async requestInitialBalances({ commit, getters }, force = false): Promise<ZkInBalance[]> {
      const savedAddress: Address | undefined = this.app.$accessor.account.address;
      const localList: { lastUpdated: number; list: ZkInBalance[] } = getters.getTokensList;

      if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
        return localList.list;
      }
      const syncWallet: Wallet | undefined = walletData.get().syncWallet;

      if (syncWallet === undefined) {
        return localList.list;
      }

      const accountState: AccountState | undefined = await syncWallet?.getAccountState();
      if (accountState !== undefined) {
        walletData.set({ accountState });
      } else {
        return localList.list;
      }
      const loadedTokens: { zkBalances: BalanceToReturn[]; tokens: Tokens } = await this.app.$accessor.tokens.loadTokensAndBalances();

      const loadInitialBalancesPromises = Object.keys(loadedTokens.tokens).map(async (key: TokenSymbol): Promise<ZkInBalance> => {
        const currentToken: TokenInfo = loadedTokens.tokens[key];
        const balance: BigNumber = await syncWallet.getEthereumBalance(key.toString());
        try {
          this.app.$accessor.tokens.getTokenPrice(currentToken.symbol);
        } catch (error) {
          this.commit("tokens/addRestrictedToken", currentToken.symbol);
        }
        return <ZkInBalance>{
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
      const balancesResults: ZkInBalance[] = await Promise.all(loadInitialBalancesPromises).catch((error) => {
        this.$sentry.captureException(error);
        return <ZkInBalance[]>[];
      });
      const balances: ZkInBalance[] = balancesResults.filter((singleBalance: ZkInBalance) => singleBalance && singleBalance.rawBalance.gt(0)).sort(utils.compareTokensById);
      const balancesEmpty: ZkInBalance[] = balancesResults.filter((token: ZkInBalance) => token && token.rawBalance.lte(0)).sort(utils.sortBalancesAZ);
      balances.push(...balancesEmpty);
      if (savedAddress !== this.app.$accessor.account.address) {
        return localList.list;
      }
      commit("setTokensList", {
        lastUpdated: new Date().getTime(),
        list: balances,
      });
      return balances;
    },

    /**
     *
     * @param commit
     * @param getters
     * @param force
     * @param offset
     * @param options
     * @return {Promise}
     */
    async requestTransactionsHistory({ commit, getters }, { force = false, offset = 0 }: { force?: boolean; offset?: number }): Promise<ZkInTx[]> {
      clearTimeout(getTransactionHistoryAgain as NodeJS.Timeout);
      const localList: { lastUpdated: number; list: ZkInTx[] } = getters.getTransactionsList;
      const savedAddress: Address | undefined = this.app.$accessor.account.address;
      /**
       * If valid we're returning cached transaction list
       */
      if (!force && localList.lastUpdated > new Date().getTime() - 30000 && offset === 0) {
        return localList.list;
      }
      try {
        const syncWallet: Wallet | undefined = walletData.get().syncWallet;
        const fetchTransactionHistory: ZkInTx[] = await this.$http.$get(`https://${ZK_API_BASE}/api/v0.1/account/${syncWallet?.address()}/history/${offset}/25`);
        console.log(fetchTransactionHistory);
        if (savedAddress !== this.app.$accessor.account.address || fetchTransactionHistory.length < 1) {
          return localList.list;
        }
        commit("setTransactionsList", {
          lastUpdated: new Date().getTime(),
          // @ts-ignore
          list: offset === 0 ? fetchTransactionHistory : [...localList.list, ...fetchTransactionHistory],
        });
        // @ts-ignore
        return fetchTransactionHistory as ZkInTx[];
      } catch (error) {
        this.$sentry!.captureException(error);
        this.app.$toast.global.zkException({
          message: error.message,
        });
        getTransactionHistoryAgain = setTimeout((): void => {
          this.app.$accessor.wallet.requestTransactionsHistory({ force: true });
        }, 15000);
        return localList.list;
      }
    },
    async requestFees({ getters, commit }, { address, symbol, feeSymbol, type }): Promise<ZkInFeesObj> {
      const savedFees: ZkIFeesInterface = getters.getFees;
      if (savedFees.symbol?.feeSymbol?.type?.address?.lastUpdated > new Date().getTime() - 30000) {
        return savedFees[symbol][feeSymbol][type][address].value;
      }
      const syncProvider: Provider | undefined = walletData.get().syncProvider;
      const syncWallet: Wallet | undefined = walletData.get().syncWallet;
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
        const batchWithdrawFeeFast: BigNumber = await syncProvider!.getTransactionsBatchFee(["FastWithdraw", "Transfer"], [address, syncWallet?.address()], feeSymbol);
        const batchWithdrawFeeNormal: BigNumber = await syncProvider!.getTransactionsBatchFee(["Withdraw", "Transfer"], [address, syncWallet?.address()], feeSymbol);
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
    async requestWithdrawalProcessingTime({ getters, commit }): Promise<ZkInWithdrawalTime | undefined> {
      if (getters.getWithdrawalProcessingTime) {
        return getters.getWithdrawalProcessingTime;
      }
      const withdrawTime: unknown = await this.$http.$get(`https://${ZK_API_BASE}/api/v0.1/withdrawal_processing_time`);
      // @ts-ignore
      commit("setWithdrawalProcessingTime", withdrawTime?.data);
      console.log(withdrawTime);
      // @ts-ignore
      return withdrawTime?.data as ZkInWithdrawalTime;
    },
    async checkLockedState({ commit }): Promise<void> {
      const pubKeyHash: PubKeyHash | undefined = await walletData.get().syncWallet?.signer?.pubKeyHash();
      if (pubKeyHash !== undefined) {
        commit("setAccountLockedState", pubKeyHash !== walletData.get().accountState?.committed.pubKeyHash);
      }
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
        this.app.$accessor.account.updateLoadingHint("Processing...");
        if (firstSelect) {
          console.log("first select");
          walletCheck = !!(await state.onboard?.walletSelect());
          console.log(walletCheck);
          if (!walletCheck) {
            return false;
          }
        }
        walletCheck = !!(await state.onboard?.walletCheck());
        console.log("11221");
        if (!walletCheck) {
          return false;
        }

        console.log("11221-1");
        if (!web3Wallet.get()?.eth) {
          return false;
        }

        console.log("11221-2");
        const getAccounts: string[] | undefined = await web3Wallet.get()?.eth.getAccounts();
        if (!getAccounts || getAccounts.length === 0) {
          return false;
        }

        console.log("11221-4");

        if (walletData.get().syncWallet) {
          console.log(walletData.get().syncWallet?.address());
          this.app.$accessor.account.setAddress(walletData.get().syncWallet?.address() || "");
          return true;
        }

        console.log("11221-5");
        const currentProvider: provider | undefined = web3Wallet.get()?.eth.currentProvider;
        if (!currentProvider) {
          return false;
        }

        const ethWallet: ethers.providers.JsonRpcSigner = new ethers.providers.Web3Provider(currentProvider as ExternalProvider).getSigner();

        const syncProvider: Provider = await getDefaultProvider(ZK_NETWORK as Network, "HTTP");

        if (syncProvider === undefined) {
          return false;
        }

        watcher.changeNetworkSet(dispatch, this);

        this.app.$accessor.account.updateLoadingHint("Follow the instructions in your wallet");

        const syncWallet: Wallet | undefined = await Wallet.fromEthSigner(ethWallet, syncProvider);

        this.app.$accessor.account.updateLoadingHint("Getting wallet information...");

        const accountState = await syncWallet?.getAccountState();
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
        this.$sentry!.captureException(error);
        if (!error.message.includes("User denied")) {
          this.app.$toast.global.zkException({
            message: `Error: ${error.message}`,
          });
          this.$router.push("/");
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
      commit("clearDataStorage");
    },

    errorDuringLogin({ state }, { force, message }: { force: boolean; message: string }): void {
      this.app.$toast.global.zkException({
        message,
      });
      if (force) {
        state.onboard?.walletReset();
        this.app.$accessor.account.setSelectedWallet("");
      }
    },
  },
);
