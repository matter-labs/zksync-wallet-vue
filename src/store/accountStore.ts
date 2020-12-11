import { action, observable } from 'mobx';
import { ethers } from 'ethers';

export class AccountStore {
  @observable txs: any = [];
  @observable accountId = 0;
  @observable accountChanging = false;
  @observable isLoggedIn = false;
  @observable isAccountUnlockingProcess = false;
  @observable isOnchainAuthSigningKeySet: boolean | undefined = undefined;
  @observable ethSignerAddress = '';
  @observable accountAddress: string | undefined = undefined;
  @observable zksContract: ethers.Contract | undefined = undefined;

  /**
   * Limit number of reconnections in case of error
   * @type {number}
   */
  @observable reconnectionLimit = 5;
  @observable reconnectionLimitDefault = 5;

  /**
   * Connection error
   * @type {string}
   */
  @observable connectionError = '';

  @action
  intervalAsyncStateUpdater(func, funcArguments, timeout: number, cancelable) {
    cancelable(func(...funcArguments))
      .then(() => {
        this.connectionError = '';
        this.reconnectionLimit = this.reconnectionLimitDefault;
        setTimeout(() => this.intervalAsyncStateUpdater(func, funcArguments, timeout, cancelable), timeout);
      })
      .catch((err) => {
        this.connectionError = err.message;
        if (--this.reconnectionLimit > 0) {
          setTimeout(() => this.intervalAsyncStateUpdater(func, funcArguments, timeout, cancelable), timeout);
        }
      });
  }
}
