import { action, observable } from 'mobx';

import { Tokens } from 'zksync/build/types';

import { IEthBalance, IPrice } from 'types/Common';
import { INFURA_ID, LINKS_CONFIG, RESTRICTED_TOKENS } from 'src/config';
import { sortBalancesById } from 'src/utils';
import { BigNumber, ethers } from 'ethers';
import { Provider, Web3Provider } from '@ethersproject/providers';

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
   * Internal value stored to minify number of API-calls
   *
   * @type {BigNumber}
   * @private
   */
  @observable private _expiringGasPrice?: Promise<BigNumber>;

  /**
   * Unify access to the provider (maybe will move it to Vue
   *
   * @type {Web3Provider|Provider}
   * @private
   */
  @observable private _web3Provider?: Web3Provider | Provider;

  /**
   * Universal method to grab only those token which is valid for the fee payments
   * @param {string} feeToken
   * @return {string}
   */
  @action
  filterFeeToken(feeToken: string) {
    return this.isTokenValid(feeToken) ? feeToken : this.getNotEmptyFeeToken();
  }

  /**
   * Checks the token
   *
   * @param {string} feeToken
   * @return {boolean}
   */
  @action
  isTokenValid(feeToken: string) {
    return !RESTRICTED_TOKENS?.includes(feeToken);
  }

  /**
   * Auto-select fee token
   * @return {string}
   */
  @action
  getNotEmptyFeeToken() {
    /**
     * If zkBalances are empty
     */
    if (!this.isAccountBalanceNotEmpty && !this.isAccountBalanceLoading && this.zkBalancesLoaded) {
      return '';
    }
    /**
     * Find token with the right balance
     */
    const zkTokenBalance = this.getZkBalances(true)
      .filter(singleBalance => singleBalance.balance > 0)
      .shift();
    if (zkTokenBalance) {
      return zkTokenBalance?.symbol as string;
    }
    return '';
  }

  /**
   * Get zkBalances excluding restricted tokens
   * @param {boolean} filterRestricted
   * @return {IEthBalance[]}
   */
  @action
  getZkBalances(filterRestricted = false) {
    return filterRestricted
      ? this.zkBalances.filter(singleBalance => this.isTokenValid(singleBalance.symbol))
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

  @action getProvider(): Web3Provider | Provider {
    if (!this._web3Provider) {
      this._web3Provider = ethers.getDefaultProvider(LINKS_CONFIG.network, {
        alchemy: LINKS_CONFIG.alchemyApiKey,
        infura: INFURA_ID,
      });
    }
    return this._web3Provider;

    // new ethers.providers.Web3Provider(store.provider),
  }

  /**
   * Get and store gasPrice for limited time
   *
   * @return {Promise<BigNumber>}
   */
  @action
  getGasPrice() {
    if (!this._expiringGasPrice) {
      this._expiringGasPrice = this.getProvider().getGasPrice();
    }
    return this._expiringGasPrice;
  }
}
