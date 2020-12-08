import { action, observable } from 'mobx';

import { Tokens } from 'zksync/build/types';

import { IEthBalance, IPrice } from 'types/Common';
import { RESTRICTED_TOKENS } from 'src/config';
import { sortBalancesById } from 'src/utils';

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

  /**
   * Auto-select fee token
   * @return {string}
   */
  @action
  getNotEmptyFeeToken() {
    /**
     * If zkBalances are empty
     */
    if (
      !this.isAccountBalanceNotEmpty &&
      !this.isAccountBalanceLoading &&
      this.zkBalancesLoaded
    ) {
      return '';
    }
    /**
     * Find token with the right balance
     */
    const zkTokenBalance = this.zkBalances
      .slice()
      .filter(
        singleBalance =>
          !RESTRICTED_TOKENS?.includes(singleBalance.symbol) &&
          singleBalance.balance > 0,
      )
      .shift();
    return zkTokenBalance?.symbol ? zkTokenBalance.symbol : '';
  }

  /**
   * Get zkBalances excluding restricted tokens
   * @param {boolean} filterRestricted
   * @return {IEthBalance[]}
   */
  @action
  getZkBalances(filterRestricted = false) {
    return filterRestricted
      ? this.zkBalances.filter(singleBalance => {
          return !RESTRICTED_TOKENS?.includes(
            singleBalance.symbol.toUpperCase(),
          );
        })
      : this.zkBalances;
  }

  /**
   * Sorted Balances
   * @return {IEthBalance[]}
   */
  @action
  getAccountsSorted() {
    return this.zkBalances.slice().sort(sortBalancesById);
  }
}
