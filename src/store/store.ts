import { observable } from 'mobx';

import { IBalances } from '../types/Common';
import { JsonRpcSigner } from 'ethers/providers/json-rpc-provider';
import { Wallet } from 'zksync';

export const createStore = () => {
  const store = {
    ethBalance: observable.box<number>(0),
    ethId: observable.box<string>(''),
    ethWallet: observable.box<JsonRpcSigner>(),
    zkBalance: observable.box<IBalances>(),
    zkWallet: observable.box<Wallet>(),

    setEthBalance(balance: number): void {
      this.ethBalance.set(balance);
    },

    setEthId(id: string): void {
      this.ethId.set(id);
    },

    setEthWallet(wallet: JsonRpcSigner): void {
      this.ethWallet.set(wallet);
    },

    setZkBalance(balance: IBalances): void {
      this.zkBalance.set(balance);
    },

    setZkWallet(wallet: Wallet): void {
      this.zkWallet.set(wallet);
    },
  };

  return store;
};

export type TStore = ReturnType<typeof createStore>;
