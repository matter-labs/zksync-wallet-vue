import { observable } from 'mobx';

export const createStore = () => {
  const store = {
    ehtBalance: observable.box<number>(0),
    ethId: observable.box<string>(''),
    zkBalance: observable.box<number>(0),

    setEthBalance(balance: number): void {
      this.ehtBalance.set(balance);
    },

    setEthId(id: string): void {
      this.ethId.set(id);
    },

    setZkBalance(balance: number): void {
      this.zkBalance.set(balance);
    },
  };

  return store;
};

export type TStore = ReturnType<typeof createStore>;
