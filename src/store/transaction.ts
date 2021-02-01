import { RootState } from '~/store';
import { BigNumber } from "ethers";
import { GetterTree, ActionTree, MutationTree } from 'vuex';
import { walletData } from "@/plugins/walletData";
import { ETHOperation, GweiBalance } from "@/plugins/types";

var updateBalancesTimeout = undefined as any;

interface depositsInterface {
  [tokenSymbol: string]: Array<{
    hash: string,
    amount: string,
    status: string,
    confirmations: number
  }>
}

export const state = () => ({
  watchedTransactions: {} as {
    [txHash: string]: {
      [prop: string]: string,
      status: string,
    }
  },
  deposits: {} as depositsInterface,
  forceUpdateTick: 0,
  withdrawalTxToEthTx: new Map() as Map<string, string>
});

export type TransactionModuleState = ReturnType<typeof state>;

export const mutations: MutationTree<TransactionModuleState> = {
  updateTransactionStatus(state, {hash, status/* , tokenSymbol, type */}): void {
    if(status==='Verified') {
      delete state.watchedTransactions[hash];
      return;
    }
    if(!state.watchedTransactions.hasOwnProperty(hash)) {
      state.watchedTransactions[hash]={
        status,
        /* tokenSymbol,
        type */
      };
    }
    else {
      state.watchedTransactions[hash].status=status;
    }
  },
  updateDepositStatus(state, {tokenSymbol, hash, amount, status, confirmations}) {
    if(!Array.isArray(state.deposits[tokenSymbol])){
      state.deposits[tokenSymbol]=[];
    }
    var txIndex = -1;
    for (let a = 0; a < state.deposits[tokenSymbol].length; a++) {
      if(state.deposits[tokenSymbol][a].hash===hash) {
        txIndex=a;
        break;
      }
    }
    if(txIndex===-1){
      state.deposits[tokenSymbol].push({
        hash, amount, status, confirmations
      });
      state.forceUpdateTick++;
    }
    else {
      state.deposits[tokenSymbol][txIndex].status = status;
      state.forceUpdateTick++;
    }
  },
  setWithdrawalTx(state, {tx, ethTx}) {
    state.withdrawalTxToEthTx.set(tx, ethTx);
  }
  /* updateStatuses(state) {
    var symbolsStatuses = {} as {
      [prop: string]: string,
    };
    for(const txHash in state.watchedTransactions) {
      const symbol = state.watchedTransactions[txHash].tokenSymbol;
      const status = (state.watchedTransactions[txHash].status==="verified" || state.watchedTransactions[txHash].status==="error")?"Verified":"Pending";
      if(symbolsStatuses.hasOwnProperty(symbol)) {
        if(symbolsStatuses[symbol]==="Verified" && status==="Pending") {
          symbolsStatuses[symbol]="Pending";
        }
      }
      else {
        symbolsStatuses[symbol]=status;
      }
      if(status==="Verified") {
        delete state.watchedTransactions[txHash];
      }
    }
    for(const symbol in symbolsStatuses) {
      // @ts-ignore: Unreachable code error
      this.commit('wallet/setZkBalanceStatus', {tokenSymbol: symbol, status: symbolsStatuses[symbol]});
    }
  } */
};

export const getters: GetterTree<TransactionModuleState, RootState> = {
  depositList(state) {
    state.forceUpdateTick;
    return state.deposits;
  },
  getWithdrawalTx(state) {
    return (tx: string):(string | undefined) => {
      return state.withdrawalTxToEthTx.get(tx);
    }
  }
};

export const actions: ActionTree<TransactionModuleState, RootState> = {
  async watchTransaction({ dispatch, commit, state }, {transactionHash, existingTransaction/* , tokenSymbol, type */}): Promise<void> {
    try {
      if(state.watchedTransactions.hasOwnProperty(transactionHash)) {
        return;
      }
      if(!existingTransaction) {
        const commitedTransaction = await walletData.get().syncProvider!.notifyTransaction(transactionHash, "COMMIT");
        commit('updateTransactionStatus', {hash:transactionHash, status:'Commited'});
        dispatch('requestBalancesUpdate');
      }
      else {
        commit('updateTransactionStatus', {hash:transactionHash, status:'Commited'});
      }
      const verifiedTransaction = await walletData.get().syncProvider!.notifyTransaction(transactionHash, "VERIFY");
      commit('updateTransactionStatus', {hash:transactionHash, status:'Verified'});
      dispatch('requestBalancesUpdate');
    } catch (error) {
      commit('updateTransactionStatus', {hash:transactionHash, status:'Verified'});
    }
  },
  async watchDeposit({ dispatch, commit }, {depositTx, tokenSymbol, amount}: {depositTx: ETHOperation, tokenSymbol: string, amount: string}): Promise<void> {
    try {
      commit('updateDepositStatus', {hash: depositTx!.ethTx.hash, tokenSymbol, amount, status: 'Initiated', confirmations: 1});
      const commitedDeposit = await depositTx.awaitEthereumTxCommit();
      dispatch('requestBalancesUpdate');
      //commit('updateDepositStatus', {hash: depositTx!.ethTx.hash, tokenSymbol, amount, status: 'Initiated', confirmations: commitedDeposit.confirmations});
      const depositReceipt = await depositTx.awaitReceipt();
      dispatch('requestBalancesUpdate');
      commit('updateDepositStatus', {hash: depositTx!.ethTx.hash, tokenSymbol, status: 'Commited'});
      const depositVerifyReceipt = await depositTx.awaitVerifyReceipt();
      dispatch('requestBalancesUpdate');
      commit('updateDepositStatus', {hash: depositTx!.ethTx.hash, tokenSymbol, status: 'Verified'});
    } catch (error) {
      commit('updateDepositStatus', {hash: depositTx!.ethTx.hash, tokenSymbol, status: 'Verified'});
    }
  },
  async requestBalancesUpdate({ dispatch }): Promise<void> {
    clearTimeout(updateBalancesTimeout);
    updateBalancesTimeout = setTimeout(() => {
      this.dispatch('wallet/getzkBalances', { accountState: undefined, force: true });
      this.dispatch('wallet/getTransactionsHistory', { offset: 0, force: true });
    }, 2000);
  },
};
