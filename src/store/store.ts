import { observable } from 'mobx';

import { IEthBalance } from '../types/Common';
import { JsonRpcSigner } from 'ethers/providers/json-rpc-provider';
import { Tokens } from 'zksync/build/types';
import { Wallet } from 'zksync';

export const createStore = () => ({
  error: observable.box<string>(''),
  ethBalances: observable.box<IEthBalance[]>([]),
  ethId: observable.box<string>(''),
  ethWallet: observable.box<JsonRpcSigner>(),
  isAccessModalOpen: observable.box<boolean>(false),
  provider: observable.box<any>(),
  tokens: observable.box<Tokens>(),
  walletName: observable.box<string>(''),
  zkBalances: observable.box<IEthBalance[]>([]),
  zkWallet: observable.box<Wallet>(),

  setAccessModal(isOpen: boolean): void {
    this.isAccessModalOpen.set(isOpen);
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

  setProvider(provider: any): void {
    this.provider.set(provider);
  },

  setTokens(tokens: Tokens): void {
    this.tokens.set(tokens);
  },

  setWalletName(name: string): void {
    this.walletName.set(name);
  },

  setZkBalances(balances: IEthBalance[]): void {
    this.zkBalances.set(balances);
  },

  setZkWallet(wallet: Wallet): void {
    this.zkWallet.set(wallet);
  },
});

export type TStore = ReturnType<typeof createStore>;
