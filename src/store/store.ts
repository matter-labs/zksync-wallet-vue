import { observable } from 'mobx';

import { IEthBalance, ITransaction } from '../types/Common';
import { JsonRpcSigner } from 'ethers/providers/json-rpc-provider';
import { Tokens } from 'zksync/build/types';
import { Wallet } from 'zksync';

export const createStore = () => ({
  depositModal: observable.box<boolean>(false),
  error: observable.box<string>(''),
  ethBalances: observable.box<IEthBalance[]>([]),
  ethId: observable.box<string>(''),
  ethWallet: observable.box<JsonRpcSigner>(),
  normalBg: observable.box<boolean>(false),
  isAccessModalOpen: observable.box<boolean>(false),
  isModalOpen: observable.box<boolean>(false),
  provider: observable.box<any>(),
  tokens: observable.box<Tokens>(),
  transactionModal: observable.box<ITransaction>(),
  walletName: observable.box<string>(''),
  withdrawModal: observable.box<boolean>(false),
  zkBalances: observable.box<IEthBalance[]>([]),
  zkWallet: observable.box<Wallet | null>(),

  setAccessModal(isOpen: boolean): void {
    this.isAccessModalOpen.set(isOpen);
  },

  setDepositModal(depositModal: boolean): void {
    this.depositModal.set(depositModal);
  },

  setError(error: string): void {
    this.error.set(error);
  },

  setEthBalances(balances: IEthBalance[]): void {
    this.ethBalances.set(balances);
  },

  setEthId(id: string): void {
    this.ethId.set(id);
  },

  setEthWallet(wallet: JsonRpcSigner): void {
    this.ethWallet.set(wallet);
  },

  setNormalBg(normalBg: boolean): void {
    this.normalBg.set(normalBg);
  },

  setModal(isModalOpen: boolean): void {
    this.isModalOpen.set(isModalOpen);
  },

  setProvider(provider: any): void {
    this.provider.set(provider);
  },

  setTokens(tokens: Tokens): void {
    this.tokens.set(tokens);
  },

  setTransactionModal(transactionModal: ITransaction): void {
    this.transactionModal.set(transactionModal);
  },

  setWalletName(name: string): void {
    this.walletName.set(name);
  },

  setWithdrawModal(withdrawModal: boolean): void {
    this.withdrawModal.set(withdrawModal);
  },

  setZkBalances(balances: IEthBalance[]): void {
    this.zkBalances.set(balances);
  },

  setZkWallet(wallet: Wallet | null): void {
    this.zkWallet.set(wallet);
  },
});

export type TStore = ReturnType<typeof createStore>;
