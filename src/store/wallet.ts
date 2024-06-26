import { ZK_API_BASE } from "@/plugins/build";
import onboardConfig from "@/plugins/onboardConfig";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import watcher from "@/plugins/watcher";
import web3Wallet from "@/plugins/web3";
import {
  iWallet,
  ZkInBalance,
  ZkInBalancesList,
  ZkInFeesInterface,
  ZkInFeesObj,
  ZkInNFT,
  ZkInTx,
  ZkInWithdrawalTime,
  ZKStoreRequestBalancesParams,
  zkTokensParam,
  ZKTypeDisplayBalances,
  ZKTypeDisplayToken,
} from "@/types/lib";
import { ExternalProvider } from "@ethersproject/providers";
import Onboard from "bnc-onboard";
import { API } from "bnc-onboard/dist/src/interfaces";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { provider } from "web3-core";
import { closestPackableTransactionFee, Provider, Wallet } from "zksync";
import { AccountState, Address, Fee, NFT, TokenSymbol } from "zksync/build/types";

let getTransactionHistoryAgain: ReturnType<typeof setTimeout>;

export const state = (): iWallet => ({
  onboard: undefined,
  isAccountLocked: false,
  zkTokens: {
    lastUpdated: 0,
    list: [],
  },
  nftTokens: {
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
  setAccountLockedState(state: WalletModuleState, accountState: boolean): void {
    state.isAccountLocked = accountState;
  },
  setOnboard(state: WalletModuleState, obj: API): void {
    state.onboard = obj;
  },
  setTokensList(state: WalletModuleState, obj: { lastUpdated: number; list: ZkInBalance[] }): void {
    state.initialTokens = obj;
  },
  setZkTokens(state: WalletModuleState, zkTokensParam: zkTokensParam): void {
    state.zkTokens = zkTokensParam;
  },
  setNftTokens(state: WalletModuleState, obj: { lastUpdated: number; list: ZkInNFT[] }): void {
    state.nftTokens = obj;
  },
  setTransactionsList(
    state: WalletModuleState,
    obj: {
      lastUpdated: number;
      list: ZkInTx[];
    },
  ): void {
    state.transactionsHistory = obj;
  },
  setWithdrawalProcessingTime(
    state: WalletModuleState,
    obj: {
      normal: number;
      fast: number;
    },
  ): void {
    state.withdrawalProcessingTime = obj;
  },
  setFees(
    state: WalletModuleState,
    { symbol, feeSymbol, type, address, obj }: { symbol: TokenSymbol; feeSymbol: TokenSymbol; type: string; address: Address; obj: ZkInFeesObj },
  ): void {
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
  clearDataStorage(state: WalletModuleState): void {
    state.zkTokens = {
      lastUpdated: 0,
      list: [],
    };
    state.nftTokens = {
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
  isAccountLocked: (state: WalletModuleState): boolean => state.isAccountLocked,
  getTokensList: (state: WalletModuleState): { lastUpdated: number; list: ZkInBalance[] } => state.initialTokens,
  getInitialBalances: (state: WalletModuleState): ZkInBalance[] => state.initialTokens.list,
  getzkList: (state: WalletModuleState): { lastUpdated: number; list: ZkInBalance[] } => state.zkTokens,
  getzkBalances: (state: WalletModuleState): ZkInBalance[] => state.zkTokens.list,
  getNftBalances: (state: WalletModuleState): Array<ZkInNFT> => state.nftTokens.list,
  getTransactionsHistory: (state: WalletModuleState): ZkInTx[] => state.transactionsHistory.list,
  getTransactionsList: (state: WalletModuleState): { lastUpdated: number; list: ZkInTx[] } => state.transactionsHistory,
  getWithdrawalProcessingTime: (state: WalletModuleState): false | { normal: number; fast: number } => state.withdrawalProcessingTime,
  getFees: (state: WalletModuleState): ZkInFeesInterface => state.fees,
  getAccountState: (): Provider | undefined => walletData.get().syncProvider,
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
        this.app.$sentry?.captureException(error);
      });
      await this.app.$accessor.wallet.requestZkBalances({ accountState: undefined, force: false }).catch((error: unknown) => {
        this.app.$sentry?.captureException(error);
      });
      await this.app.$accessor.wallet.requestTransactionsHistory({ force: true }).catch((error: unknown) => {
        this.app.$sentry?.captureException(error);
      });
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
    async requestZkBalances(
      { state, commit, getters },
      { accountState, force = false }: { accountState?: AccountState; force?: boolean },
    ): Promise<{ balances: ZkInBalance[]; nfts: ZkInNFT[] }> {
      type BalancesList = {
        [token: string]: BigNumberish;
      };
      type NftList = {
        [tokenId: number]: NFT;
      };
      let listCommitted: BalancesList = {};
      let listVerified: BalancesList = {};
      let nftCommitted: NftList = {};
      let nftVerified: NftList = {};
      const tokensList: ZkInBalance[] = [];
      const nftList: Array<ZkInNFT> = [];
      const syncWallet = walletData.get().syncWallet;
      const savedAddress = this.app.$accessor.account.address;
      if (accountState) {
        listCommitted = accountState.committed.balances;
        listVerified = accountState.verified.balances;
        nftCommitted = accountState.committed.nfts;
        nftVerified = accountState.verified.nfts;
      } else {
        const localBalancesList = getters.getzkList;
        if (!force && localBalancesList.lastUpdated > new Date().getTime() - 60000) {
          return {
            balances: localBalancesList.list,
            nfts: getters.getNftBalances,
          };
        }
        const newAccountState: AccountState | undefined = await syncWallet?.getAccountState();
        walletData.set({ accountState: newAccountState });
        listCommitted = newAccountState?.committed.balances || {};
        listVerified = newAccountState?.verified.balances || {};
        nftCommitted = newAccountState?.committed.nfts || {};
        nftVerified = newAccountState?.verified.nfts || {};
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
          return {
            balances: state.zkTokens.list,
            nfts: state.nftTokens.list,
          };
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
      for (const nftID in nftCommitted) {
        nftList.push({
          ...nftCommitted[nftID],
          status: nftVerified.hasOwnProperty(nftID) ? "Verified" : "Pending",
        });
      }
      commit("setZkTokens", {
        lastUpdated: new Date().getTime(),
        list: tokensList.sort(utils.sortBalancesAZ),
      });
      commit("setNftTokens", {
        lastUpdated: new Date().getTime(),
        list: nftList.sort(utils.compareTokensById),
      });
      return {
        balances: tokensList,
        nfts: nftList,
      };
    },

    /**
     * @param commit
     * @param getters
     * @param force
     * @return {Promise<*[]|*>}
     */
    async requestInitialBalances({ commit, getters }, force = false): Promise<ZkInBalance[] | undefined> {
      const savedAddress = this.app.$accessor.account.address;
      const localList = getters.getTokensList;

      if (!force && localList.lastUpdated > new Date().getTime() - 60000) {
        return localList.list;
      }
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
        let balance;
        try {
          balance = await syncWallet.getEthereumBalance(key.toLocaleString());
        } catch (error) {
          console.log(`Can't get L1 balance of ${key.toLocaleString()}`, error);
          balance = BigNumber.from(0);
        }
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
        this.app.$sentry?.captureException(error);
        console.log("balancesResults error", error);
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
    async requestTransactionsHistory({ commit, getters }, { force = false, offset = 0 }: ZKStoreRequestBalancesParams): Promise<ZkInTx[]> {
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
        if (!syncWallet || !syncWallet.address() || !String(syncWallet.address()).includes("0x")) {
          return localList.list;
        }
        const fetchTransactionHistory: ZkInTx[] = await this.app.$http.$get(`https://${ZK_API_BASE}/api/v0.1/account/${syncWallet?.address()}/history/${offset}/25`);
        if (savedAddress !== this.app.$accessor.account.address) {
          return localList.list;
        }
        commit("setTransactionsList", {
          lastUpdated: new Date().getTime(),
          list: offset === 0 ? fetchTransactionHistory : [...localList.list, ...fetchTransactionHistory],
        });
        return fetchTransactionHistory;
      } catch (error) {
        this.app.$sentry?.captureException(error);
        this.app.$toast.global.zkException({
          message: error.message,
        });
        getTransactionHistoryAgain = setTimeout(() => {
          this.app.$accessor.wallet.requestTransactionsHistory({ force: true });
        }, 1500);
        return localList.list;
      }
    },

    async requestFees({ getters, commit }, { address, symbol, feeSymbol, type, force }): Promise<ZkInFeesObj | undefined> {
      const savedFees = getters.getFees;
      if (
        !force &&
        Object.prototype.hasOwnProperty.call(savedFees, symbol) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol], feeSymbol) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol], type) &&
        Object.prototype.hasOwnProperty.call(savedFees[symbol][feeSymbol][type], address) &&
        savedFees[symbol][feeSymbol][type][address].lastUpdated > new Date().getTime() - 10000
      ) {
        return savedFees[symbol][feeSymbol][type][address].value;
      }
      const syncProvider = walletData.get().syncProvider;
      const syncWallet = walletData.get().syncWallet;
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
      } else if (type === "nft-withdraw") {
        const foundFeeFast: Fee = await syncProvider!.getTransactionFee("FastWithdrawNFT", address, feeSymbol);
        const foundFeeNormal: Fee = await syncProvider!.getTransactionFee("WithdrawNFT", address, feeSymbol);
        const feesObj: ZkInFeesObj = {
          fast: foundFeeFast !== undefined ? closestPackableTransactionFee(foundFeeFast.totalFee) : undefined,
          normal: foundFeeNormal !== undefined ? closestPackableTransactionFee(foundFeeNormal.totalFee) : undefined,
        };
        commit("setFees", { symbol: feeSymbol, feeSymbol, type, address, obj: feesObj });
        return feesObj;
      } else if (type === "MintNFT") {
        const foundFeeNormal = await syncProvider!.getTransactionFee("MintNFT", address, feeSymbol);
        const feesObj: ZkInFeesObj = {
          fast: undefined,
          normal: foundFeeNormal !== undefined ? closestPackableTransactionFee(foundFeeNormal.totalFee) : undefined,
        };
        commit("setFees", { symbol: feeSymbol, feeSymbol, type, address, obj: feesObj });
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
      const withdrawTime: ZkInWithdrawalTime = await this.app.$http.$get(`https://${ZK_API_BASE}/api/v0.1/withdrawal_processing_time`);
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
        const syncProvider = await walletData.syncProvider.get();
        if (syncProvider === undefined) {
          return false;
        }
        this.app.$accessor.account.setLoadingHint("Follow the instructions in your wallet");
        const syncWallet = await Wallet.fromEthSigner(ethWallet, syncProvider);

        walletData.set({
          syncWallet,
        });

        this.app.$accessor.account.setLoadingHint("Getting wallet information...");
        watcher.changeNetworkSet(dispatch, this);

        /* The user can press Cancel login anytime so we need to check if he did after every long action (request) */
        if (!walletData.get().syncWallet) {
          return false;
        }

        const accountState: AccountState | undefined = await syncWallet!.getAccountState();

        walletData.set({
          accountState,
        });

        if (!walletData.get().syncWallet) {
          return false;
        }

        await this.app.$accessor.tokens.loadTokensAndBalances();

        if (!walletData.get().syncWallet) {
          return false;
        }

        await this.app.$accessor.wallet.requestZkBalances({ accountState });

        if (!walletData.get().syncWallet) {
          return false;
        }

        await this.app.$accessor.wallet.checkLockedState();

        if (!walletData.get().syncWallet) {
          return false;
        }

        this.app.$accessor.account.setAddress(syncWallet.address());
        this.app.$accessor.account.setNameFromStorage();
        this.app.$accessor.account.setLoggedIn(true);
        this.app.$accessor.contacts.getContactsFromStorage();
        return true;
      } catch (error) {
        this.app.$sentry?.captureException(error);
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
      walletData.clear();
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
      const activeDeposits: ZkInBalancesList = await this.app.$accessor.transaction.getActiveDeposits();
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
