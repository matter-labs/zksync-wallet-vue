import { observable, action, computed } from 'mobx';

export class TransactionStore {
  @observable pureAmountInputValue = '';
  @observable copyHintShown = false;
}
