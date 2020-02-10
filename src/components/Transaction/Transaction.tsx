import React, { useCallback, useState } from 'react';

import { ITransactionProps } from './Types';

import { INPUT_VALIDATION } from '../../constants/regExs';

import { useRootData } from '../../hooks/useRootData';
import { useTransaction } from '../../hooks/useTransaction';

import './Transaction.scss';

const Transaction: React.FC<ITransactionProps> = ({
  addressValue,
  balances,
  hash,
  isExecuted,
  isInput,
  isLoading,
  onChangeAddress,
  onChangeAmount,
  price,
  title,
  transactionAction,
  zkBalances,
}): JSX.Element => {
  const { ethId, setTransactionModal } = useRootData(({ ethId, setTransactionModal }) => ({
    ethId: ethId.get(),
    setTransactionModal,
  }));

  const { setExecuted, setHash } = useTransaction();

  const [token, setToken] = useState<string>('');
  const [inputValue, setInputValue] = useState<number | string>('');
  const [maxValue, setMaxValue] = useState<number>(0);
  const [value, setValue] = useState<string>(localStorage.getItem('walletName') || '');

  const validateNumbers = e => {
    if (INPUT_VALIDATION.digits.test(e)) {
      e <= maxValue ? setInputValue(e) : setInputValue(maxValue);
    } else {
      setInputValue(0);
    }
  };

  const handleCancel = useCallback(() => {
    setHash('');
    setExecuted(false);
    setTransactionModal({ title: '', input: false, action: false });
  }, [setExecuted, setTransactionModal, setHash]);

  const setWalletName = useCallback(() => {
    if (value && value !== ethId) {
      localStorage.setItem('walletName', value);
    } else {
      setValue(localStorage.getItem('walletName') || ethId);
    }
  }, [ethId, value]);

  return (
    <div className="transaction-wrapper">
      {isExecuted ? (
        <>
          <p>{typeof hash === 'string' ? hash : hash?.hash}</p>
        </>
      ) : (
        <>
          {isLoading ? ( // need to remove later
            <>
              <span>Loading...</span>
              <button
                onClick={() => {
                  handleCancel();
                  setWalletName();
                }}
              ></button>
            </>
          ) : (
            <>
              <button onClick={() => handleCancel()} className="transaction-back"></button>
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
              {zkBalances?.length &&
                zkBalances.map(({ balance }) => (
                  <p key={balance} className="transaction-fee">
                    Fee: <span>{balance * 0.001}</span>
                  </p>
                ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Transaction;
