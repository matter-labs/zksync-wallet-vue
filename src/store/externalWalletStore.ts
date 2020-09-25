import { observable, action, computed } from 'mobx';

export class ExternaWalletStore {
  @observable externalWalletAddress = '';
  @observable externalWalletTokenId = 0;
  @observable externalWalletAccountId = 0;
  @observable externalWalletContractBalance = 0;
  @observable externalWalletEthersSigner: any = {};
  @observable externalWalletInitializing = false;
  @observable externalWalletContractBalances: any = {};
  @observable externalWalletContractBalancesLoaded = false;
}
