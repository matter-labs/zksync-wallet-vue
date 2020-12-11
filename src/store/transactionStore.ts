import { ContractTransaction, ethers } from 'ethers';
import { action, observable } from 'mobx';
import { LINKS_CONFIG, RESTRICTED_TOKENS } from 'src/config';

export class TransactionStore {
  @observable recepientAddress = '';
  @observable amountShowedValue = '';
  @observable amountValue = 0;
  @observable amountBigValue: ethers.BigNumberish = 0;
  @observable pureAmountInputValue = '';
  @observable changePubKeyFee = 0;
  @observable changePubKeyFees: any = {};
  @observable conditionError = '';
  @observable gas: ethers.BigNumberish = 0;
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
  @observable waitingCalculation = false;

  @observable amount: any = 0;
  @observable selectedBalance = '';
  @observable selectedContact = '';

  /**
   * Withdrawal process local states:
   * TokenAmount
   */
  @observable withdrawalFeeAmount: ethers.BigNumberish = 0;
  @observable withdrawalFeeToken = '';
  @observable withdrawalAmount: ethers.BigNumberish = 0;
  @observable withdrawalToken = '';

  /**
   * Setting up the token filter
   * @param {string} symbol
   * @param {string} defaultSymbol
   * @return {string}
   */
  @action
  setTransferFeeToken(symbol: string, defaultSymbol = '') {
    symbol = symbol || this.symbolName;
    if (symbol && !RESTRICTED_TOKENS?.includes(symbol)) {
      this.transferFeeToken = symbol;
    }
    else {
      this.transferFeeToken = defaultSymbol;
    }

    return this.transferFeeToken;
  }

  /**
   * Get fee token or replace it with symbolName if empty
   * @return {string}
   */
  @action getFeeToken() {
    if (!this.transferFeeToken) {
      this.transferFeeToken = RESTRICTED_TOKENS?.includes(this.symbolName) ? '' : this.symbolName;
    }
    return this.transferFeeToken;
  }

  /**
   * @return {any}
   */
  @action
  getFeeBasedOnType() {
    return this.fastWithdrawal ? this.fastFee : this.fee[this.getFeeToken()];
  }

  /**
   * Get gas amount needed for the transaction
   * @return {Promise<unknown>}
   */
  @action
  getGas() {
    return new Promise((resolve, reject) => {
      if (!this.gas) {
        ethers
          .getDefaultProvider(LINKS_CONFIG.network)
          .getGasPrice()
          .then((res) => {
            this.gas = ethers.BigNumber.from(res.toString());
            resolve(this.gas);
          })
          .catch(reject);
      } else {
        resolve(this.gas);
      }
    });
  }
}
