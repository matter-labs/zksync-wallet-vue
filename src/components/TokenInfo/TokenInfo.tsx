import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

import { handleExponentialNumbers } from 'src/utils';

import './TokenInfo.scss';

export const TokenInfo = observer(() => {
  const store = useStore();
  const history = useHistory();

  useEffect(() => {
    if (store.zkWallet && !store.propsSymbolName) {
      history.push('/account');
    }
  }, [store.zkWallet, store.propsSymbolName, store.price]);

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
          <h3>{store.propsSymbolName}</h3>
        </div>
        {store.price && (
          <p className='token-info-title-price'>{'Token price:'}</p>
        )}
        <p>
          {store.price && store.propsSymbolName && (
            <>
              {'$'}
              {store.price[store.propsSymbolName]
                ? store.price[store.propsSymbolName].toFixed(2)
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
              {store.propsSymbolName}{' '}
              {store.propsMaxValue &&
                handleExponentialNumbers(+store.propsMaxValue)}
            </h2>
            <p>
              {store.price &&
                `~$${(
                  +(store.price[store.propsSymbolName]
                    ? store.price[store.propsSymbolName]
                    : 0) * store.propsMaxValue
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
