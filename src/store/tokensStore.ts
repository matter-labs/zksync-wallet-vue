import { observable } from 'mobx';
import { ethers } from 'ethers';

import { Tokens } from 'zksync/build/types';

import { IEthBalance, IPrice } from '../types/Common';

export class TokensStore {
  @observable awaitedTokens = {};
  @observable awaitedTokensConfirmations = {};
  @observable isAccountBalanceNotEmpty = false;
  @observable isAccountBalanceLoading = true;
  @observable ethBalances: IEthBalance[] = [];
  @observable MLTTclaimed = false;
  @observable tokenPrices?: IPrice;
  @observable tokens?: Tokens;
  @observable.shallow zkBalances: IEthBalance[] = [];
  @observable zkBalancesLoaded = false;
}
