import { ContractTransaction, ethers } from 'ethers';
import { action, observable } from 'mobx';
import { RESTRICTED_TOKENS } from 'src/config';

export class TransactionStore {
  @observable recepientAddress = '';
  @observable amountShowedValue = '';
  @observable amountValue = 0;
  @observable amountBigValue: ethers.BigNumberish = 0;
  @observable pureAmountInputValue = '';
  @observable changePubKeyFee = 0;
  @observable changePubKeyFees: any = {};
  @observable conditionError = '';
  @observable gas = '';
  @observable fee: any = {};
  @observable isTransactionExecuted = false;
  @observable transferFeeToken = '';
  @observable feeTokenSelection = false;
  @observable filteredContacts: any = [];
  @observable isBalancesListOpen = false;
  @observable isContactsListOpen = false;
  @observable symbolName = '';
  @observable tokenAddress = '';
  @observable transactionHash: string | ContractTransaction | undefined = '';
  @observable fastFee: ethers.BigNumberish = 0;
  @observable maxValue = 0;
  @observable isLoading = false;
  @observable fastWithdrawal = false;
  @observable withdrawalProcessingTime = 0;
  @observable fastWithdrawalProcessingTime = 0;
  @observable withCloseMintModal = true;
  @observable tokenInUnlockingProgress: string[] = [];
  @observable propsMaxValue: any;
  @observable propsSymbolName: any;
  @observable propsToken: any;

  /**
   * Setting up the token filter
   * @param {string} feeToken
   */
  @action
  setTransferFeeToken(feeToken: string) {
    if (
      RESTRICTED_TOKENS &&
      RESTRICTED_TOKENS.includes(feeToken.toUpperCase())
    ) {
      this.transferFeeToken = this.symbolName;
    } else {
      this.transferFeeToken = feeToken;
    }
  }
}
