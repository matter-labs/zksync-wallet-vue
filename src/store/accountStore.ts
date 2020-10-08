import { observable } from 'mobx';
import { ethers } from 'ethers';

export class AccountStore {
  @observable accountChanging = false;
  @observable isAccountUnlockingProcess = false;
  @observable isOnchainAuthSigningKeySet: boolean | undefined = undefined;
  @observable ethSignerAddress = '';
  @observable zksContract: ethers.Contract | undefined = undefined;
}
