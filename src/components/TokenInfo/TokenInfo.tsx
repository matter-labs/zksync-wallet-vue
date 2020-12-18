import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

import { handleExponentialNumbers } from 'src/utils';

import './TokenInfo.scss';

export const TokenInfo = observer(() => {
  const store = useStore();

  const { TransactionStore, TokensStore } = store;

  const history = useHistory();

  useEffect(() => {
    if (store.zkWallet && !TransactionStore.propsSymbolName) {
      history.push('/account');
    }
  }, [store.zkWallet, TransactionStore.propsSymbolName, TokensStore.tokenPrices]);

  return (
    <div className='token-info-wrapper'>
      <button
        onClick={() => {
          history.push('/account');
        }}
        className='transaction-back'
      ></button>
      <div className='token-info-title-block'>
        <div>
          <h3>{TransactionStore.propsSymbolName}</h3>
        </div>
        {TokensStore.tokenPrices && (
          <p className='token-info-title-price'>{'Token price:'}</p>
        )}
        <p>
          {TokensStore.tokenPrices && TransactionStore.propsSymbolName && (
            <>
              {'$'}
              {TokensStore.tokenPrices[TransactionStore.propsSymbolName]
                ? TokensStore.tokenPrices[TransactionStore.propsSymbolName].toFixed(2)
                : 0}
            </>
          )}
        </p>
      </div>
      <div className='token-info-balance-block'>
        <div>
          <p>{'Your balance:'}</p>
        </div>
        <div className='token-info-balance'>
          <div>
            <h2>
              {TransactionStore.propsSymbolName}{' '}
              {TransactionStore.propsMaxValue && handleExponentialNumbers(+TransactionStore.propsMaxValue)}
            </h2>
            <p>
              {TokensStore.tokenPrices &&
                `~$${(
                  +(TokensStore.tokenPrices[TransactionStore.propsSymbolName]
                    ? TokensStore.tokenPrices[TransactionStore.propsSymbolName]
                    : 0) * TransactionStore.propsMaxValue
                ).toFixed(2)}`}
            </p>
          </div>

          <button
            onClick={() => {
              store.transactionType = 'withdraw';
              history.push('/withdraw');
            }}
            className='btn withdraw-button btn-tr'
          >
            <span></span>
            {'Withdraw'}
          </button>
        </div>
      </div>
      <button
        className='btn submit-button'
        onClick={() => {
          history.push('/transfer');
          store.transactionType = 'transfer';
        }}
      >
        <span className='send-icon'></span>
        {'Transfer'}
      </button>
    </div>
  );
});
