import { observable } from 'mobx';
import { ethers } from 'ethers';

export class AccountStore {
  @observable isOnchainAuthSigningKeySet: boolean | undefined = undefined;
  @observable ethSignerAddress = '';
  @observable zksContract: ethers.Contract | undefined = undefined;
}
