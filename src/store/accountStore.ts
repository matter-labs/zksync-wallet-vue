import { observable } from 'mobx';
import { ethers } from 'ethers';

export class AccountStore {
  @observable txs: any = [];
  @observable accountId = 0;
  @observable accountChanging = false;
  @observable isLoggedIn = false;
  @observable isAccountUnlockingProcess = false;
  @observable isOnchainAuthSigningKeySet: boolean | undefined = undefined;
  @observable ethSignerAddress = '';
  @observable zksContract: ethers.Contract | undefined = undefined;
}
