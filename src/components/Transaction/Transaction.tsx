import React, { useState } from 'react';

import { ITransactionProps } from './Types';

const Transaction: React.FC<ITransactionProps> = ({
  addressValue,
  balances,
  hash,
  isExecuted,
  isInput,
  isLoading,
  onCancel,
  openModal,
  onChangeAddress,
  onChangeAmount,
  price,
  title,
  transactionAction,
  zkBalances,
}): JSX.Element => {
  const [token, setToken] = useState<string>('');
  const [inputValue, setInputValue] = useState<number | string>('');
  const [maxValue, setMaxValue] = useState<number>(0);

  const validateNumbers = e => {
    if (/^[0-9]*\.?[0-9]*$/.test(e)) {
      e <= maxValue ? setInputValue(e) : setInputValue(maxValue);
    } else {
      setInputValue(0);
    }
  };

  return (
    <div className="transaction-wrapper">
      {isExecuted ? (
        <>
          <p>{typeof hash === 'string' ? hash : hash?.hash}</p>
          <button onClick={onCancel && openModal ? () => onCancel(openModal) : undefined}>Nice!</button>
        </>
      ) : (
        <>
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              <h2 className="transaction-title">{title}</h2>
              {isInput && (
                <>
                  <span className="transaction-field-title">To address</span>
                  <div className="transaction-field">
                    <div className="currency-input-wrapper">
                      <input
                        placeholder="Ox address, ENS or contact name"
                        value={addressValue}
                        onChange={onChangeAddress}
                        className="currency-input-address"
                      />
                      <select
                        className="currency-selector"
                        onChange={e => {
                          setToken(e.toString());
                          setMaxValue(+e.target.value);
                        }}
                      >
                        {balances?.length &&
                          balances.map(({ address, balance, symbol }) => (
                            <option key={address} value={balance}>
                              {symbol}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
              <span className="transaction-field-title">Amount / asset</span>
              <div className="transaction-field">
                <div className="currency-input-wrapper border">
                  <input
                    placeholder="0.00"
                    className={'currency-input'}
                    onChange={e => {
                      validateNumbers(e.target.value);
                      onChangeAmount(+e.target.value);
                    }}
                    value={inputValue}
                  />
                  <select
                    className="currency-selector"
                    onChange={e => {
                      setToken(e.toString());
                      setMaxValue(+e.target.value);
                    }}
                  >
                    {balances?.length &&
                      balances.map(({ address, balance, symbol }) => (
                        <option key={address} value={balance}>
                          {symbol}
                        </option>
                      ))}
                  </select>
                </div>
                {zkBalances?.length &&
                  zkBalances.map(({ balance, symbol }) => (
                    <div className="currency-input-wrapper" key={symbol}>
                      <span>~${price * balance}</span>
                      <span>
                        Balance: {balance} {symbol}
                      </span>
                    </div>
                  ))}
              </div>
              <button className="btn submit-button" onClick={() => transactionAction(token)}>
                {title}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Transaction;
