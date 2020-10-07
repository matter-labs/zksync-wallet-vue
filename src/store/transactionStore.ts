import { observable, action, computed } from 'mobx';

export class TransactionStore {
  @observable pureAmountInputValue = '';
  @observable changePubKeyFee = 0;
  @observable changePubKeyFees: any = {};
  @observable conditionError = '';
  @observable gas = '';
  @observable fee: any = {};
  @observable filteredContacts: any = [];
  @observable isBalancesListOpen = false;
  @observable isContactsListOpen = false;
  @observable symbolName = '';
  @observable tokenAddress = '';
  @observable maxValue = 0;
  @observable isLoading = false;
}
