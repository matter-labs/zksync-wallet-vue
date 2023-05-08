/* eslint-disable require-await */
import { BigNumber, Contract } from "ethers";
import type { BigNumberish } from "ethers";
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { TokenSymbol, Address, TokenLike, NFTInfo, AccountState as WalletAccountState } from "zksync/build/types";
import { BatchBuilder } from "zksync/build/batch-builder";
import { submitSignedTransactionsBatch, closestPackableTransactionAmount, Transaction, Wallet, RemoteWallet, utils as zkSyncUtils } from "zksync";
import {
  ModuleOptions,
  DecimalBalance,
  ZkTransactionType,
  ZkFeeParams,
  ZkCPKStatus,
  ZkFee,
  ZkTokenBalance,
  ZkTokenBalances,
  ZkTransactionMainToken,
  ZkTransactionStep,
  ZkActiveTransaction,
  ZkActiveTransactionData,
  ZkFeeType,
  ZkFeesChange,
  ZkTransferBatchItem,
  ZkEthereumBalances,
} from "@/types/zksync";
import { parseDecimal, contendAddressToRawContentHash, filterError } from "@/utils";

let resolveFeeChanged: ((result: boolean) => void) | undefined;

export type TransactionState = {
  type?: ZkTransactionType;
  address?: Address;
  transferBatch?: ZkTransferBatchItem[];
  symbol?: TokenSymbol;
  nftExists: boolean;
  nftExistsLoading: boolean;
  feeSymbol?: TokenSymbol;
  feeSymbolAutoSelected: boolean;
  fee?: BigNumber;
  accountActivationFee?: BigNumber;
  amount?: DecimalBalance;
  contentHash?: string;
  feeLoading: boolean;
  activationFeeLoading: boolean;
  activeTransaction?: ZkActiveTransaction;
  error?: Error;
  feeError?: Error;
  feesChangeSaved: ZkFeesChange;
  feesChange?: ZkFeesChange;
};

export const state = (_: ModuleOptions): TransactionState => ({
  type: undefined,
  address: undefined,
  transferBatch: undefined,
  symbol: undefined,
  nftExists: false,
  nftExistsLoading: false,
  feeSymbol: undefined,
  feeSymbolAutoSelected: true,
  fee: undefined,
  accountActivationFee: undefined,
  amount: undefined,
  contentHash: undefined,
  feeLoading: false,
  activationFeeLoading: false,
  activeTransaction: undefined,
  error: undefined,
  feeError: undefined,
  feesChangeSaved: {},
  feesChange: undefined,
});

export const getters: GetterTree<TransactionState, TransactionState> = {
  type: (state) => state.type,
  address: (state) => state.address,
  transferBatch: (state) => state.transferBatch,
  symbol: (state) => state.symbol,
  nftExists: (state) => state.nftExists,
  nftExistsLoading: (state) => state.nftExistsLoading,
  feeSymbol: (state) => (typeof state.symbol === "string" && !state.feeSymbol ? state.symbol : state.feeSymbol),
  feeSymbolAutoSelected: (state) => state.feeSymbolAutoSelected,
  realFeeSymbol: (state) => state.feeSymbol,
  fee: (state) => state.fee,
  accountActivationFee: (state) => state.accountActivationFee,
  amount: (state) => state.amount,
  contentHash: (state) => state.contentHash,
  feeLoading: (state) => state.feeLoading,
  activationFeeLoading: (state) => state.activationFeeLoading,
  activeTransaction: (state) => state.activeTransaction,
  error: (state) => state.error,
  feeError: (state) => state.feeError,
  feesChangeSaved: (state) => state.feesChangeSaved,
  feesChange: (state) => state.feesChange,

  transactionActionName: (state) => {
    if (!state.type) {
      return undefined;
    }
    switch (state.type) {
      case "Transfer":
        return "Send on zkSync";
      case "Deposit":
        return "Top up";
      case "Withdraw":
        return "Send to Ethereum";
      case "Mint":
        return "Mint";
      case "MintNFT":
        return "Mint NFT";
      case "TransferNFT":
        return "Send NFT on zkSync";
      case "WithdrawNFT":
        return "Withdraw NFT to Ethereum";
      case "CPK":
        return "Activate account";
      case "WithdrawPending":
        return "Withdraw pending balance";
      default:
        return state.type;
    }
  },
  amountBigNumber: (state, _, __, rootGetters) => {
    const syncProvider = rootGetters["zk-provider/syncProvider"];
    if (!state.symbol || !syncProvider || !state.amount) {
      return;
    }
    try {
      return parseDecimal(syncProvider, state.symbol, state.amount);
    } catch (error) {
      console.warn(`Error while parsing amount of ${state.symbol}\n`, error);
      return BigNumber.from("0");
    }
  },
  maxAmount: (state, getters, __, rootGetters) => {
    if (!state.symbol) {
      return BigNumber.from("0");
    }
    if (getters.mainToken === "L1-Tokens") {
      // eslint-disable-next-line no-unused-expressions
      rootGetters["zk-balances/ethereumBalanceLoadingAll"];
      const tokenEthereumBalance: BigNumber | undefined = rootGetters["zk-balances/ethereumBalance"](state.symbol);
      if (!tokenEthereumBalance) {
        return BigNumber.from("0");
      }
      return tokenEthereumBalance;
    } else if (getters.mainToken === "PendingTokens") {
      const tokenPendingBalance: BigNumberish | undefined = rootGetters["zk-balances/pendingBalance"](state.symbol);
      if (!tokenPendingBalance) {
        return BigNumber.from("0");
      }
      return tokenPendingBalance;
    } else if (getters.mainToken === "L2-Tokens") {
      const tokenBalance: BigNumberish | undefined = (<ZkTokenBalance>rootGetters["zk-balances/balances"][state.symbol])?.balance;
      const currentBalance = BigNumber.from(tokenBalance || "0");
      if (getters.feeSymbol === state.symbol) {
        const maxAmount = currentBalance.sub(getters.totalFee);
        if (maxAmount.gte("0")) {
          return closestPackableTransactionAmount(maxAmount);
        } else {
          return BigNumber.from("0");
        }
      } else {
        return closestPackableTransactionAmount(currentBalance);
      }
    }
    return BigNumber.from("0");
  },
  mainToken: (state): ZkTransactionMainToken => {
    switch (state.type) {
      case "Deposit":
      case "Allowance":
      case "Mint":
        return "L1-Tokens";

      case "WithdrawPending":
        return "PendingTokens";

      case "MintNFT":
        return false;

      case "TransferNFT":
      case "WithdrawNFT":
        return "L2-NFT";

      case "Transfer":
      case "TransferBatch":
      case "Withdraw":
      default:
        return "L2-Tokens";
    }
  },
  allowCustomFeeToken: (_, getters) => getters.mainToken !== "L1-Tokens" && getters.mainToken !== "PendingTokens",
  fees: (state, getters, _, rootGetters) => {
    if (getters.mainToken === "L1-Tokens" || getters.mainToken === "PendingTokens") {
      return [];
    }
    const fees: ZkFee[] = [{ key: "txFee", amount: state.fee }];
    if (rootGetters["zk-wallet/cpk"] !== true) {
      fees.push({ key: "accountActivation", amount: state.accountActivationFee });
    }
    return fees.filter(({ amount }: ZkFee) => BigNumber.isBigNumber(amount));
  },
  totalFee: (_, getters) => {
    if (getters.fees.length > 0) {
      return getters.fees
        .map((e: ZkFee) => e.amount)
        .filter((e?: BigNumber) => BigNumber.isBigNumber(e))
        .reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.add(currentValue));
    }
    return BigNumber.from("0");
  },
  enoughBalanceToPayFee: (_, getters, __, rootGetters): boolean => {
    if (getters.mainToken === "L1-Tokens" || getters.mainToken === "PendingTokens") {
      return true;
    }
    if (!getters.feeSymbol || !getters.totalFee) {
      return false;
    }
    const tokenBalance: ZkTokenBalance | undefined = rootGetters["zk-balances/balances"][getters.feeSymbol];
    if (!tokenBalance) {
      return false;
    }
    return (getters.totalFee as BigNumber).lte(tokenBalance.balance);
  },
  enoughAllowance: (state, getters, _, rootGetters): boolean => {
    if (state.type === "Deposit" && state.symbol) {
      // eslint-disable-next-line no-unused-expressions
      rootGetters["zk-balances/tokensAllowanceForceUpdate"];
      const tokenAllowance = rootGetters["zk-balances/tokenAllowance"](state.symbol);
      if (!tokenAllowance) {
        return false;
      }
      return tokenAllowance.gte(getters.amountBigNumber || "0");
    }
    return true;
  },
  availableAmount: (state, getters, _, rootGetters) => {
    const zeroAmount = BigNumber.from("0");
    if (!state.symbol) return zeroAmount;
    const tokenBalance: ZkTokenBalance = rootGetters["zk-balances/balances"][state.symbol];
    if (!tokenBalance) return zeroAmount;
    if (state.symbol === getters.feeSymbol) {
      return BigNumber.from(tokenBalance.balance).sub(state.fee || "0");
    }
    return BigNumber.from(tokenBalance.balance);
  },
  commitAllowed: (state, getters, __, rootGetters): boolean => {
    const accountActivatedCheck = rootGetters["zk-wallet/cpk"] === true || Boolean(!state.activationFeeLoading && state.accountActivationFee);
    const feeCheck = Boolean(!state.feeLoading && state.fee && getters.enoughBalanceToPayFee);
    const amountNotZero = getters.amountBigNumber ? getters.amountBigNumber.gt("0") : false;
    switch (state.type) {
      case "Deposit":
        return Boolean(state.address && state.symbol && amountNotZero && getters.enoughAllowance && !rootGetters["zk-balances/tokensAllowanceLoading"][state.symbol]);
      case "Mint":
      case "WithdrawPending":
        return Boolean(state.symbol && amountNotZero && !rootGetters["zk-balances/pendingBalancesLoading"][state.symbol]);
      case "Allowance":
        return Boolean(state.symbol);
      case "MintNFT":
        return Boolean(state.address && getters.feeSymbol && state.contentHash && feeCheck && accountActivatedCheck);
      case "WithdrawNFT":
      case "TransferNFT":
        return Boolean(state.address && getters.feeSymbol && state.symbol && state.nftExists && !state.nftExistsLoading && feeCheck && accountActivatedCheck);
      case "CPK":
        return Boolean(getters.feeSymbol && !state.activationFeeLoading && state.accountActivationFee);
      case "TransferBatch":
        return Boolean(getters.feeSymbol && feeCheck && accountActivatedCheck);

      default:
        return Boolean(state.address && getters.feeSymbol && state.symbol && amountNotZero && feeCheck && accountActivatedCheck);
    }
  },
  requiredFees: (_, getters, __, rootGetters): ZkFeeType[] => {
    if (getters.mainToken === "L2-Tokens" || getters.mainToken === "L2-NFT" || getters.type === "MintNFT") {
      const fees: ZkFeeType[] = [];
      if (getters.type !== "CPK") {
        fees.push("txFee");
      }
      if (rootGetters["zk-wallet/cpk"] !== true || getters.type === "CPK") {
        fees.push("accountActivation");
      }
      return fees;
    }
    return [];
  },
};

export const mutations: MutationTree<TransactionState> = {
  setType: (state, type?: ZkTransactionType) => (state.type = type),
  setAddress: (state, address?: Address) => (state.address = address),
  setTransferBatch: (state, transferBatch?: ZkTransferBatchItem[]) => (state.transferBatch = transferBatch),
  setSymbol: (state, symbol?: TokenSymbol) => (state.symbol = symbol),
  setNFTExists: (state, status: boolean) => (state.nftExists = status),
  setNFTExistsLoading: (state, status: boolean) => (state.nftExistsLoading = status),
  setFeeSymbol: (state, feeSymbol?: TokenSymbol) => (state.feeSymbol = feeSymbol),
  setFeeSymbolAutoSelected: (state, status: boolean) => (state.feeSymbolAutoSelected = status),
  setFee: (state, fee?: BigNumber) => (state.fee = fee),
  setAccountActivationFee: (state, fee?: BigNumber) => (state.accountActivationFee = fee),
  setAmount: (state, amount?: string) => (state.amount = amount),
  setContentHash: (state, contentHash?: string) => (state.contentHash = contentHash),
  setFeeLoading: (state, status: boolean) => (state.feeLoading = status),
  setActivationFeeLoading: (state, status: boolean) => (state.activationFeeLoading = status),
  setError: (state, error: Error) => (state.error = error),
  setFeeError: (state, error: Error) => (state.feeError = error),
  setFeesChangeSaved: (state, feesChange: ZkFeesChange) => (state.feesChangeSaved = feesChange),
  setFeesChange: (state, feesChange?: ZkFeesChange) => (state.feesChange = feesChange),
  clearActiveTransaction: (state) => (state.activeTransaction = undefined),
  setNewActiveTransaction: (state, type: ZkTransactionType) => {
    state.activeTransaction = { type, step: "initial" };
    state.error = undefined;
  },
  setActiveTransactionStep: (state, step: ZkTransactionStep) => (state.activeTransaction!.step = step),
  setActiveTransactionTxHash: (state, txHash: string) => (state.activeTransaction!.txHash = txHash),
  setActiveTransactionAddress: (state, address: string) => (state.activeTransaction!.address = address),
  setActiveTransactionData: (state, data: ZkActiveTransactionData) => (state.activeTransaction!.data = data),
  setActiveTransactionAmountToken: (state, { amount, token }: { amount?: BigNumberish; token: TokenLike }) => {
    state.activeTransaction!.amount = amount;
    state.activeTransaction!.token = token;
  },
  setActiveTransactionFeeAmountToken: (state, { amount, token }: { amount?: BigNumberish; token: TokenSymbol }) => {
    state.activeTransaction!.fee = amount;
    state.activeTransaction!.feeToken = token;
  },
  clear: (state) => {
    state.type = undefined;
    state.address = undefined;
    state.transferBatch = undefined;
    state.symbol = undefined;
    state.nftExists = false;
    state.nftExistsLoading = false;
    state.feeSymbol = undefined;
    state.feeSymbolAutoSelected = true;
    state.fee = undefined;
    state.accountActivationFee = undefined;
    state.amount = undefined;
    state.contentHash = undefined;
    state.feeLoading = false;
    state.activationFeeLoading = false;
    state.activeTransaction = undefined;
    state.error = undefined;
    state.feesChangeSaved = {};
    state.feesChange = undefined;
    resolveFeeChanged = undefined;
  },
};

export const actions: ActionTree<TransactionState, TransactionState> = {
  async setType({ commit, dispatch, getters, rootGetters }, type?: ZkTransactionType) {
    commit("clearActiveTransaction");
    commit("setError", undefined);
    commit("setFee", undefined);
    commit("setAccountActivationFee", undefined);
    commit("setFeeError", undefined);
    commit("setType", type);
    if (type) {
      if (["Deposit", "Mint", "Withdraw", "WithdrawNFT", "MintNFT"].includes(type)) {
        commit("setAddress", rootGetters["zk-account/address"]);
      } else {
        commit("setAddress", undefined);
      }
      if (getters.symbol !== undefined) {
        if (getters.mainToken === "L2-NFT" && typeof getters.symbol !== "number") {
          commit("setSymbol", undefined);
        } else if ((getters.mainToken === "L1-Tokens" || getters.mainToken === "PendingTokens" || getters.mainToken === "L2-Tokens") && typeof getters.symbol !== "string") {
          commit("setSymbol", undefined);
        } else if (getters.type === "Mint") {
          commit("setSymbol", undefined);
        } else {
          dispatch("setSymbol", getters.symbol);
        }
      }
      const balances: ZkTokenBalances = rootGetters["zk-balances/balances"];
      if ((type === "MintNFT" || type === "CPK" || getters.mainToken === "L2-NFT") && (!getters.feeSymbol || !balances[getters.feeSymbol]?.feeAvailable)) {
        await dispatch("setRandomAcceptableFeeSymbol");
      }
      await dispatch("requestAllFees");
    }
  },
  async setAddress({ commit, dispatch }, address?: Address) {
    commit("setAddress", address);
    await dispatch("requestFee");
  },
  async setSymbol({ getters, commit, dispatch, rootGetters }, symbol?: TokenLike) {
    commit("setFee", undefined);
    commit("setAccountActivationFee", undefined);
    commit("setError", undefined);
    if (typeof symbol === "string") {
      if (getters.mainToken === "L1-Tokens") {
        if (!rootGetters["zk-balances/ethereumBalance"](symbol) && getters.type !== "Mint") {
          symbol = undefined;
        }
      }
    } else if (typeof symbol === "number" && getters.mainToken === "L2-NFT") {
      if (!rootGetters["zk-balances/nfts"][symbol]) {
        symbol = undefined;
      }
    }
    commit("setSymbol", symbol);
    if (getters.feeSymbolAutoSelected) {
      commit("setFeeSymbol", undefined);
    }
    if (symbol && (getters.type === "Deposit" || getters.type === "Allowance")) {
      dispatch("zk-balances/requestAllowance", { symbol }, { root: true });
    } else if (symbol && getters.type === "WithdrawPending") {
      dispatch("zk-balances/requestPendingBalance", { symbol }, { root: true });
    } else if (symbol) {
      if (!getters.realFeeSymbol) {
        const isTokenFeeAcceptable = await dispatch("zk-tokens/isTokenFeeAcceptable", symbol, { root: true });
        if (!isTokenFeeAcceptable) {
          await dispatch("setRandomAcceptableFeeSymbol");
        }
      }
    }
    dispatch("checkNFTSymbol");
    dispatch("requestAllFees");
  },
  async setFeeSymbol({ commit, dispatch }, feeSymbol?: TokenSymbol) {
    commit("setFeeSymbolAutoSelected", false);
    commit("setFeeSymbol", feeSymbol);
    await dispatch("requestAllFees");
  },
  async fillEmptySymbol({ dispatch, getters, rootGetters }) {
    if (getters.symbol) {
      return;
    }
    if (getters.mainToken === "L2-Tokens") {
      if (!rootGetters["zk-account/accountStateRequested"]) {
        await dispatch("zk-account/updateAccountState", null, { root: true });
        if (getters.symbol) {
          return;
        }
      }
      const balances: ZkTokenBalances = rootGetters["zk-balances/balances"];
      const balancesSymbols = Object.entries(balances)
        .filter(([_, tokenData]) => BigNumber.from(tokenData.balance).gt("0"))
        .map(([symbol]) => symbol);
      if (balancesSymbols.length > 0) {
        dispatch("setSymbol", balancesSymbols[0]);
      }
    } else if (getters.mainToken === "L1-Tokens" && getters.type !== "Mint") {
      if (!rootGetters["zk-balances/ethereumBalancesRequested"]) {
        await dispatch("zk-balances/requestEthereumBalances", null, { root: true });
        if (getters.symbol) {
          return;
        }
      }
      const balances: ZkEthereumBalances = rootGetters["zk-balances/ethereumBalances"];
      const balancesSymbols = Object.entries(balances)
        .filter(([_, balance]) => BigNumber.from(balance).gt("0"))
        .map(([symbol]) => symbol);
      if (balancesSymbols.length > 0) {
        dispatch("setSymbol", balancesSymbols[0]);
      }
    }
  },
  async setRandomAcceptableFeeSymbol({ commit, dispatch, rootGetters }) {
    if (!rootGetters["zk-account/accountStateRequested"] || rootGetters["zk-account/accountStateLoading"]) {
      await dispatch("zk-account/updateAccountState", null, { root: true });
    }
    const balances: ZkTokenBalances = rootGetters["zk-balances/balances"];
    for (const symbol in balances) {
      if (balances[symbol].feeAvailable) {
        commit("setFeeSymbol", symbol);
        commit("setFeeSymbolAutoSelected", true);
        break;
      }
    }
  },
  async checkNFTSymbol({ getters, commit, dispatch }) {
    commit("setNFTExists", false);
    if (typeof getters.symbol !== "number" || getters.mainToken !== "L2-NFT") {
      commit("setNFTExistsLoading", false);
      return;
    }
    commit("setNFTExistsLoading", true);
    const searchedNFT: number = getters.symbol;
    const resultNFT: NFTInfo | false = await dispatch("zk-tokens/getNFT", searchedNFT, { root: true });
    if (searchedNFT !== getters.symbol) {
      return;
    }
    commit("setNFTExists", !!resultNFT);
    commit("setNFTExistsLoading", false);
  },
  async requestFee({ getters, commit, dispatch }, force = false) {
    commit("setFee", undefined);
    commit("setFeeError", undefined);
    if (!getters.feeSymbol || getters.mainToken === "L1-Tokens" || getters.mainToken === "PendingTokens") {
      return;
    }
    commit("setFeeLoading", true);
    const isTokenFeeAcceptable = await dispatch("zk-tokens/isTokenFeeAcceptable", getters.feeSymbol, { root: true });
    if (!isTokenFeeAcceptable) {
      console.warn(`${getters.feeSymbol} is not acceptable for paying fees (at transaction/requestFee)`);
      commit("setFeeLoading", false);
      return;
    }
    const feeParams: ZkFeeParams = {
      address: getters.address,
      symbol: getters.symbol,
      feeSymbol: getters.feeSymbol,
      force,
    };
    let fee: BigNumber | undefined;
    if (!getters.address && getters.type !== "TransferBatch") {
      commit("setFeeLoading", false);
      return;
    }
    try {
      switch (getters.type) {
        case "Transfer":
        case "TransferNFT":
          fee = await dispatch("zk-fees/getTransferFee", feeParams, { root: true });
          break;
        case "TransferBatch":
          fee = await dispatch("zk-fees/getTransferBatchFee", { force, feeSymbol: feeParams.feeSymbol, batch: getters.transferBatch }, { root: true });
          break;
        case "Withdraw":
          fee = await dispatch("zk-fees/getWithdrawFee", feeParams, { root: true });
          break;
        case "MintNFT":
          fee = await dispatch("zk-fees/getMintNFTFee", feeParams, { root: true });
          break;
        case "WithdrawNFT":
          fee = await dispatch("zk-fees/getWithdrawNFTFee", feeParams, { root: true });
          break;
        case "Deposit":
        case "Allowance":
        case "Mint":
        case "WithdrawPending":
          break;

        default:
          fee = await dispatch("zk-fees/getTransactionFee", { ...feeParams, type: getters.type }, { root: true });
          break;
      }
      commit("setFee", fee);
    } catch (error: any) {
      commit("setFeeError", `Requesting fee error${error && error.message ? ": " + error.message : ""}`);
    }
    commit("setFeeLoading", false);
    return getters.fee;
  },
  async requestAccountActivationFee({ getters, commit, dispatch, rootGetters }, force = false) {
    commit("setAccountActivationFee", undefined);
    commit("setFeeError", undefined);
    if (!rootGetters["zk-account/loggedIn"]) {
      return;
    }
    if (rootGetters["zk-wallet/cpk"] === true) {
      return;
    }
    if (!getters.feeSymbol || getters.mainToken === "L1-Tokens" || getters.mainToken === "PendingTokens") {
      return;
    }
    commit("setActivationFeeLoading", true);
    const isTokenFeeAcceptable = await dispatch("zk-tokens/isTokenFeeAcceptable", getters.feeSymbol, { root: true });
    if (!isTokenFeeAcceptable) {
      console.warn(`${getters.feeSymbol} is not acceptable for paying fees (at transaction/requestAccountActivationFee)`);
      commit("setActivationFeeLoading", false);
      return;
    }
    const feeParams: ZkFeeParams = {
      address: getters.address,
      symbol: getters.symbol,
      feeSymbol: getters.feeSymbol,
      force,
    };
    try {
      const accountActivationFee: BigNumber = await dispatch("zk-fees/getAccountActivationFee", feeParams, { root: true });
      commit("setAccountActivationFee", accountActivationFee);
    } catch (error: any) {
      commit("setFeeError", `Requesting fee error${error && error.message ? ": " + error.message : ""}`);
    }
    commit("setActivationFeeLoading", false);
    return getters.accountActivation;
  },
  async requestAllFees({ getters, dispatch }, force = false) {
    await Promise.all([dispatch("requestFee", force), dispatch("requestAccountActivationFee", force)]);
    return {
      fee: getters.fee,
      accountActivation: getters.accountActivationFee,
    };
  },
  async saveCurrentFees({ getters, commit }) {
    const requiredFees = getters.requiredFees;
    const currentFees: ZkFeesChange = {};
    if (requiredFees.includes("txFee") && getters.fee) {
      currentFees.txFee = {
        symbol: getters.feeSymbol,
        amount: getters.fee,
      };
    }
    if (requiredFees.includes("accountActivation") && getters.accountActivationFee) {
      currentFees.accountActivation = {
        symbol: getters.feeSymbol,
        amount: getters.accountActivationFee,
      };
    }
    commit("setFeesChangeSaved", currentFees);
  },
  async checkCurrentFees({ getters, commit }) {
    const requiredFees = getters.requiredFees;
    const newFees: ZkFeesChange = {};
    if (requiredFees.includes("txFee") && getters.fee && getters.feesChangeSaved.txFee && getters.feesChangeSaved.txFee.amount.lt(getters.fee)) {
      newFees.txFee = {
        symbol: getters.feeSymbol,
        amount: getters.fee,
      };
    }
    if (
      requiredFees.includes("accountActivation") &&
      getters.accountActivationFee &&
      getters.feesChangeSaved.accountActivation &&
      getters.feesChangeSaved.accountActivation.amount.lt(getters.accountActivationFee)
    ) {
      newFees.accountActivation = {
        symbol: getters.feeSymbol,
        amount: getters.accountActivationFee,
      };
    }
    if (Object.keys(newFees).length) {
      commit("setFeesChange", newFees);
      const feesChangeResolveResult = await new Promise((resolve) => {
        resolveFeeChanged = resolve;
      });
      commit("setFeesChangeSaved", {});
      commit("setFeesChange", undefined);
      return feesChangeResolveResult;
    }
    commit("setFeesChangeSaved", {});
    commit("setFeesChange", undefined);
    return true;
  },
  async feesChangeProceed(_, result: boolean) {
    if (resolveFeeChanged) {
      resolveFeeChanged(result);
    }
  },
  async addCPKToBatch({ getters, dispatch, rootGetters }, batchBuilder: BatchBuilder) {
    if (rootGetters["zk-wallet/isRemoteWallet"]) {
      return;
    }
    const syncWallet: Wallet = rootGetters["zk-wallet/syncWallet"];
    const cpkStatus: ZkCPKStatus = await dispatch("zk-wallet/checkCPK", true, { root: true });
    if (cpkStatus === false) {
      throw new Error("Account activation message wasn't signed. Make sure local storage is enabled in your browser and refresh the page.");
    } else if (cpkStatus === "signed") {
      const cpkTxJSON = localStorage.getItem(rootGetters["zk-wallet/cpkStorageKey"]);
      if (!cpkTxJSON) {
        throw new Error("Signed CPK wasn't found in storage. Make sure local storage is enabled in your browser and refresh the page.");
      }
      let cpkTx;
      try {
        cpkTx = JSON.parse(cpkTxJSON);
      } catch (error) {
        console.warn("Error parsing local storage cpk\n", error);
        await dispatch("zk-wallet/removeLocalCPK", null, { root: true });
        throw new Error("Error parsing local storage CPK. Make sure local storage is enabled in your browser and refresh the page.");
      }
      const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
      if (cpkTx.accountId !== accountState.id) {
        console.warn(`Wrong local CPK account id. Saved ${cpkTx.accountId}; current ${accountState.id}`);
        await dispatch("zk-wallet/removeLocalCPK", null, { root: true });
        throw new Error("Wrong local CPK account id. Please, sign account activation again.");
      }
      if (cpkTx.nonce !== accountState.committed.nonce) {
        console.warn(`Wrong local CPK account nonce. Saved ${cpkTx.nonce}; current ${accountState.committed.nonce}`);
        await dispatch("zk-wallet/removeLocalCPK", null, { root: true });
        throw new Error("Wrong local CPK account nonce. Please, sign account activation again.");
      }
      if (syncWallet.ethSignerType?.verificationMethod === "ERC-1271") {
        cpkTx.ethAuthData = {
          type: "Onchain",
        };
      }
      if (!getters.accountActivationFee) {
        dispatch("requestAccountActivationFee");
        throw new Error("No account activation fee was found. Try again.");
      }
      const changePubKeyTx = await syncWallet.signer!.signSyncChangePubKey({
        ...cpkTx,
        fee: getters.accountActivationFee,
        feeTokenId: syncWallet.provider.tokenSet.resolveTokenId(getters.feeSymbol),
      });
      batchBuilder.addChangePubKey({
        tx: changePubKeyTx,
        // @ts-ignore
        alreadySigned: true,
      });
    }
  },
  async addTransferToBatch({ getters }, batchBuilder: BatchBuilder) {
    if (getters.symbol === getters.feeSymbol) {
      batchBuilder.addTransfer({
        to: getters.address,
        token: getters.symbol,
        amount: getters.amountBigNumber,
        fee: getters.fee,
      });
    } else {
      batchBuilder.addTransfer({
        to: getters.address,
        token: getters.symbol,
        amount: getters.type === "TransferNFT" ? 1 : getters.amountBigNumber,
        fee: "0",
      });
    }
  },
  async addWithdrawToBatch({ getters }, batchBuilder: BatchBuilder) {
    if (getters.symbol === getters.feeSymbol) {
      batchBuilder.addWithdraw({
        ethAddress: getters.address,
        token: getters.symbol,
        amount: getters.amountBigNumber,
        fee: getters.fee,
      });
    } else {
      batchBuilder.addWithdraw({
        ethAddress: getters.address,
        token: getters.symbol,
        amount: getters.amountBigNumber,
        fee: "0",
      });
    }
  },
  async addMintNFTToBatch({ getters }, batchBuilder: BatchBuilder) {
    batchBuilder.addMintNFT({
      recipient: getters.address,
      contentHash: contendAddressToRawContentHash(getters.contentHash),
      feeToken: getters.feeSymbol,
      fee: getters.fee,
    });
  },
  async addWithdrawNFTToBatch({ getters }, batchBuilder: BatchBuilder) {
    batchBuilder.addWithdrawNFT({
      to: getters.address,
      token: getters.symbol,
      feeToken: getters.feeSymbol,
      fee: getters.fee,
    });
  },
  async cpkTransaction({ getters, commit, dispatch, rootGetters }) {
    try {
      const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
      if (!checkResult) {
        return;
      }

      const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
      commit("setNewActiveTransaction", "CPK");
      if (!rootGetters["zk-wallet/isRemoteWallet"] && (<Wallet>syncWallet).ethSignerType?.verificationMethod === "ERC-1271") {
        commit("setActiveTransactionStep", "waitingForUserConfirmation");
        const isOnchainAuthSigningKeySet = await syncWallet.isOnchainAuthSigningKeySet();
        if (!isOnchainAuthSigningKeySet) {
          const onchainAuthTransaction = await syncWallet.onchainAuthSigningKey();
          commit("setActiveTransactionStep", "committing");
          await onchainAuthTransaction?.wait();
        }
      }
      commit("setActiveTransactionStep", "waitingForUserConfirmation");
      const cpkResponse = await syncWallet.setSigningKey({
        feeToken: getters.feeSymbol,
        ethAuthType: "ECDSALegacyMessage",
        fee: getters.accountActivationFee,
      });
      commit("setActiveTransactionTxHash", cpkResponse.txHash);
      commit("setActiveTransactionStep", "committing");
      commit("setActiveTransactionFeeAmountToken", {
        token: rootGetters["zk-tokens/zkTokenByID"](cpkResponse.txData.tx.feeTokenId)?.symbol,
        amount: cpkResponse.txData.tx.fee,
      });
      await cpkResponse.awaitReceipt();
      commit("setActiveTransactionStep", "updating");
      await Promise.all([
        dispatch("zk-account/updateAccountState", true, { root: true }),
        dispatch("zk-wallet/checkCPK", true, { root: true }),
        dispatch("zk-history/getNewTransactionHistory", true, { root: true }),
      ]);
      commit("setActiveTransactionStep", "finished");
      return cpkResponse;
    } catch (error) {
      const realError = filterError(error as Error);
      if (realError) {
        commit("setError", realError);
      }
      commit("setActiveTransactionStep", "initial");
    }
  },
  async deposit({ getters, commit, dispatch, rootGetters }) {
    try {
      const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
      if (!checkResult) {
        return;
      }
      const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
      commit("setNewActiveTransaction", "Deposit");
      commit("setActiveTransactionStep", "waitingForUserConfirmation");
      dispatch("zk-wallet/openWalletApp", undefined, { root: true });
      const depositResponse = await syncWallet.depositToSyncFromEthereum({
        depositTo: getters.address,
        token: getters.symbol,
        amount: getters.amountBigNumber,
      });
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionAddress", getters.address);
      commit("setActiveTransactionTxHash", depositResponse.ethTx.hash);
      commit("setActiveTransactionAmountToken", { token: getters.symbol, amount: getters.amountBigNumber.toString() });
      commit("setActiveTransactionStep", "committing");
      await depositResponse.awaitEthereumTxCommit();
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionStep", "updating");
      const dataPromises = [
        dispatch("zk-balances/requestEthereumBalance", { force: true, symbol: "ETH" }, { root: true }),
        dispatch("zk-account/updateAccountState", true, { root: true }),
        dispatch("zk-history/getNewTransactionHistory", true, { root: true }),
      ];
      if (getters.symbol !== "ETH") {
        dataPromises.push(dispatch("zk-balances/requestAllowance", { force: true, symbol: getters.symbol }, { root: true }));
        dataPromises.push(dispatch("zk-balances/requestEthereumBalance", { force: true, symbol: getters.symbol }, { root: true }));
      }
      await Promise.all(dataPromises);
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionStep", "finished");
      return depositResponse;
    } catch (error) {
      const realError = filterError(error as Error);
      if (realError) {
        commit("setError", realError);
      }
      commit("setActiveTransactionStep", "initial");
    }
  },
  async setAllowance({ getters, commit, rootGetters, dispatch }, unlimited = true) {
    try {
      const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
      if (!checkResult) {
        return;
      }
      const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
      const tokenAddress = syncWallet.provider.tokenSet.resolveTokenAddress(getters.symbol);
      commit("setNewActiveTransaction", "Allowance");
      commit("setActiveTransactionStep", "waitingForUserConfirmation");
      dispatch("zk-wallet/openWalletApp", undefined, { root: true });
      const approveAllowance = await syncWallet.approveERC20TokenDeposits(tokenAddress, unlimited ? undefined : getters.amountBigNumber);
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionTxHash", approveAllowance.hash);
      commit("setActiveTransactionStep", "committing");
      await approveAllowance.wait();
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionStep", "updating");
      await Promise.all([
        dispatch("zk-balances/requestAllowance", { force: true, symbol: getters.symbol }, { root: true }),
        dispatch("zk-balances/requestEthereumBalance", { force: true, symbol: "ETH" }, { root: true }),
      ]);
      if (!getters.activeTransaction) {
        return;
      }
      const newTokenAllowance = rootGetters["zk-balances/tokenAllowance"](getters.symbol);
      commit("setActiveTransactionData", { token: getters.symbol, allowance: newTokenAllowance || BigNumber.from("0") });
      commit("setActiveTransactionStep", "finished");
      return approveAllowance;
    } catch (error) {
      const realError = filterError(error as Error);
      if (realError) {
        commit("setError", realError);
      }
      commit("setActiveTransactionStep", "initial");
    }
  },
  async mint({ getters, rootGetters, commit, dispatch }) {
    const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
    if (!checkResult) {
      return;
    }
    const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
    const tokenAddress = syncWallet.provider.tokenSet.resolveTokenAddress(getters.symbol);
    const ABI = [
      {
        constant: false,
        inputs: [
          {
            internalType: "address",
            name: "_to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
        ],
        name: "mint",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const erc20Mintable = new Contract(tokenAddress, ABI, syncWallet.ethSigner());
    commit("setNewActiveTransaction", "Mint");
    commit("setActiveTransactionStep", "waitingForUserConfirmation");
    dispatch("zk-wallet/openWalletApp", undefined, { root: true });
    const response = await erc20Mintable.mint(getters.address, getters.amountBigNumber);
    if (!getters.activeTransaction) {
      return;
    }
    commit("setActiveTransactionAddress", getters.address);
    commit("setActiveTransactionTxHash", response.hash);
    commit("setActiveTransactionAmountToken", { token: getters.symbol, amount: getters.amountBigNumber.toString() });
    commit("setActiveTransactionStep", "committing");
    await response.wait();
    if (!getters.activeTransaction) {
      return;
    }
    commit("setActiveTransactionStep", "updating");
    await dispatch("zk-balances/requestEthereumBalance", { force: true, symbol: getters.symbol }, { root: true });
    commit("setActiveTransactionStep", "finished");
    return response;
  },
  async withdrawPendingTransaction({ getters, commit, dispatch, rootGetters }) {
    try {
      if (rootGetters["zk-wallet/isRemoteWallet"]) {
        return;
      }
      const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
      if (!checkResult) {
        return;
      }
      const syncWallet: Wallet = rootGetters["zk-wallet/syncWallet"];
      commit("setNewActiveTransaction", "WithdrawPending");
      commit("setActiveTransactionStep", "waitingForUserConfirmation");
      dispatch("zk-wallet/openWalletApp", undefined, { root: true });
      const withdrawResponse = await syncWallet.withdrawPendingBalance(rootGetters["zk-account/address"], getters.symbol);
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionTxHash", withdrawResponse.hash);
      commit("setActiveTransactionAmountToken", { token: getters.symbol, amount: getters.amountBigNumber.toString() });
      commit("setActiveTransactionStep", "committing");
      await withdrawResponse.wait();
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionStep", "updating");
      const dataPromises = [
        dispatch("zk-balances/requestPendingBalance", { force: true, symbol: getters.symbol }, { root: true }),
        dispatch("zk-balances/requestEthereumBalance", { force: true, symbol: "ETH" }, { root: true }),
        dispatch("zk-account/updateAccountState", true, { root: true }),
        dispatch("zk-history/getNewTransactionHistory", true, { root: true }),
      ];
      if (getters.symbol !== "ETH") {
        dataPromises.push(dispatch("zk-balances/requestEthereumBalance", { force: true, symbol: getters.symbol }, { root: true }));
      }
      await Promise.all(dataPromises);
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionStep", "finished");
      return withdrawResponse;
    } catch (error) {
      const realError = filterError(error as Error);
      if (realError) {
        commit("setError", realError);
      }
      commit("setActiveTransactionStep", "initial");
    }
  },
  async labelTransactions(_, transactions: Transaction[]) {
    let transaction: Transaction | null = null;
    let feeTransaction: Transaction | null = null;
    let cpkTransaction: Transaction | null = null;
    for (const tx of transactions) {
      tx.txData.tx.fee = tx.txData.tx.fee?.toString();
      tx.txData.tx.amount = tx.txData.tx.amount?.toString();
      if (!tx.txData.tx.feeTokenId && typeof tx.txData.tx.feeToken === "number") {
        tx.txData.tx.feeTokenId = tx.txData.tx.feeToken;
      }
      if (tx.txData.tx.type === "ChangePubKey") {
        cpkTransaction = tx;
        continue;
      }
      if (tx.txData.tx.fee === "0") {
        transaction = tx;
      } else if (tx.txData.tx.amount === "0") {
        feeTransaction = tx;
      }
    }
    if (!transaction) {
      for (const tx of transactions) {
        if (tx.txData.tx.type !== "ChangePubKey") {
          transaction = tx;
        }
      }
    }
    if (!feeTransaction) {
      feeTransaction = transaction;
    }
    return {
      transaction,
      feeTransaction,
      cpkTransaction,
    };
  },
  async commitTransaction({ getters, commit, dispatch, rootGetters }, { requestFees }: { requestFees: boolean }) {
    try {
      if (!getters.commitAllowed) {
        return;
      }

      const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
      if (!checkResult) {
        return;
      }

      const transactionType: ZkTransactionType = getters.type;
      commit("setNewActiveTransaction", transactionType);
      commit("setActiveTransactionStep", "processing");

      if (requestFees && getters.requiredFees.length > 0) {
        commit("setActiveTransactionStep", "requestingLatestFees");
        await dispatch("saveCurrentFees");
        await dispatch("requestAllFees", true);
        commit("setActiveTransactionStep", "awaitingUserAction");
        const feesChangeResolveResult = await dispatch("checkCurrentFees");
        if (!feesChangeResolveResult) {
          commit("setActiveTransactionStep", "initial");
          return;
        }
        commit("setActiveTransactionStep", "processing");
      }

      if (transactionType === "Deposit") {
        return await dispatch("deposit");
      } else if (transactionType === "Allowance") {
        return await dispatch("setAllowance");
      } else if (transactionType === "Mint") {
        return await dispatch("mint");
      } else if (transactionType === "CPK") {
        return await dispatch("cpkTransaction");
      } else if (transactionType === "WithdrawPending") {
        return await dispatch("withdrawPendingTransaction");
      }
      const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
      const nonce = await syncWallet.getNonce("committed");
      const batchBuilder = syncWallet.batchBuilder(nonce);

      await dispatch("addCPKToBatch", batchBuilder);
      if (rootGetters["zk-wallet/cpk"] !== true && !getters.accountActivationFee) {
        throw new Error("No account activation fee found. Try again.");
      }
      switch (transactionType) {
        case "Transfer":
        case "TransferNFT":
          await dispatch("addTransferToBatch", batchBuilder);
          break;
        case "Withdraw":
          await dispatch("addWithdrawToBatch", batchBuilder);
          break;
        case "MintNFT":
          await dispatch("addMintNFTToBatch", batchBuilder);
          break;
        case "WithdrawNFT":
          await dispatch("addWithdrawNFTToBatch", batchBuilder);
          break;
      }
      /* Check if fee separate transaction required */
      if ((transactionType === "Transfer" || transactionType === "TransferNFT" || transactionType === "Withdraw") && getters.symbol !== getters.feeSymbol) {
        batchBuilder.addTransfer({
          to: rootGetters["zk-account/address"],
          token: getters.feeSymbol,
          amount: "0",
          fee: getters.fee,
        });
      }

      commit("setActiveTransactionStep", "waitingForUserConfirmation");
      dispatch("zk-wallet/openWalletApp", undefined, { root: true });
      const batchTransactionData = await batchBuilder.build();
      if (!getters.activeTransaction) {
        return;
      }
      commit("setActiveTransactionStep", "committing");
      const transactions = await submitSignedTransactionsBatch(
        syncWallet.provider,
        batchTransactionData.txs,
        batchTransactionData.signature ? [batchTransactionData.signature] : undefined,
      );
      if (!getters.activeTransaction) {
        return;
      }
      await transactions[0].awaitReceipt();
      commit("setActiveTransactionStep", "updating");
      const labeledTransactions = await dispatch("labelTransactions", transactions);
      if (labeledTransactions.transaction) {
        const transaction: Transaction = labeledTransactions.transaction;
        commit("setActiveTransactionTxHash", transaction.txHash);
        if (transaction.txData.tx.to) {
          commit("setActiveTransactionAddress", transaction.txData.tx.to);
        } else if (transaction.txData.tx.type === "MintNFT") {
          commit("setActiveTransactionAddress", transaction.txData.tx.creatorAddress);
        }
        let transactionToken: number | undefined = transaction.txData.tx.tokenId;
        if (typeof transactionToken !== "number" && typeof transaction.txData.tx.token === "number") {
          transactionToken = transaction.txData.tx.token;
        }
        if (typeof transactionToken === "number") {
          if (!zkSyncUtils.isNFT(transactionToken)) {
            commit("setActiveTransactionAmountToken", {
              token: rootGetters["zk-tokens/zkTokenByID"](transactionToken)?.symbol,
              amount: transaction.txData.tx.amount,
            });
          } else {
            commit("setActiveTransactionAmountToken", {
              token: transactionToken,
              amount: 1,
            });
          }
        }
      }
      if (labeledTransactions.feeTransaction) {
        const feeTransaction: Transaction = labeledTransactions.feeTransaction;
        let feeTransactionToken: number | undefined = feeTransaction.txData.tx.feeTokenId;
        if (typeof feeTransactionToken !== "number") {
          if (typeof feeTransaction.txData.tx.tokenId === "number") {
            feeTransactionToken = feeTransaction.txData.tx.tokenId;
          } else if (typeof feeTransaction.txData.tx.token === "number") {
            feeTransactionToken = feeTransaction.txData.tx.token;
          }
        }
        if (typeof feeTransactionToken === "number") {
          commit("setActiveTransactionFeeAmountToken", {
            token: rootGetters["zk-tokens/zkTokenByID"](feeTransactionToken)?.symbol,
            amount: feeTransaction.txData.tx.fee,
          });
        }
      }
      await Promise.all([dispatch("zk-account/updateAccountState", true, { root: true }), dispatch("zk-history/getNewTransactionHistory", true, { root: true })]);
      if (!getters.activeTransaction) {
        return;
      }
      if (labeledTransactions.cpkTransaction) {
        await dispatch("zk-wallet/checkCPK", true, { root: true });
      }
      commit("setActiveTransactionStep", "finished");
      if (transactionType === "TransferNFT" || transactionType === "WithdrawNFT") {
        commit("setSymbol", undefined);
      }
      return labeledTransactions;
    } catch (error) {
      const realError = filterError(error as Error);
      if (realError) {
        if (getters.type === "Mint" && realError.includes("cannot estimate gas")) {
          commit("setError", "Probably this token isn't available for minting. Try to mint a different one.");
        } else if (realError.startsWith("unknown account #0")) {
          commit("setError", "It seems that your wallet isn't connected or is locked");
        } else if (realError.length > 150) {
          console.warn("Error length is bigger than 150.\n", realError);
          commit("setError", "Unexpected error. Please, try again later.");
        } else {
          commit("setError", realError);
        }
      }
      commit("setActiveTransactionStep", "initial");
    }
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
