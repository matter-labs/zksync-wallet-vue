import { ethers } from 'ethers';
import { observable, action, computed } from 'mobx';

export class TransactionStore {
  @observable amountValue = 0;
  @observable amountBigValue: ethers.BigNumberish = 0;
  @observable pureAmountInputValue = '';
  @observable changePubKeyFee = 0;
  @observable changePubKeyFees: any = {};
  @observable conditionError = '';
  @observable gas = '';
  @observable fee: any = {};
  @observable transferFeeToken = '';
  @observable feeTokenSelection = false;
  @observable filteredContacts: any = [];
  @observable isBalancesListOpen = false;
  @observable isContactsListOpen = false;
  @observable symbolName = '';
  @observable tokenAddress = '';
  @observable fastFee: ethers.BigNumberish = 0;
  @observable maxValue = 0;
  @observable isLoading = false;
}
