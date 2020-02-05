import React, { useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { ITransactionProps } from './Types';

const CurrencyInput: React.FC<ITransactionProps> = ({ balances }): JSX.Element => {
  const [inputValue, setInputValue] = useState(0);
  const [token, setToken] = useState(0);

  const validateNumbers = e => {
    if (/^[0-9]*\.?[0-9]*$/.test(e)) {
      e <= token ? setInputValue(e) : setInputValue(token);
    } else {
      setInputValue(0);
    }
  };

  return (
    <div className="currency-input-wrapper">
      <input
        placeholder="0.00"
        className={'currency-input'}
        onChange={e => validateNumbers(e.target.value)}
        value={inputValue}
        onBlur={() => console.log(token)}
      />
      <select name="" id="" onChange={e => setToken(+e.target.value)}>
        {balances?.length &&
          balances.map(({ address, balance, symbol }) => (
            <option key={address} value={balance}>
              {symbol} {balance}
            </option>
          ))}
      </select>
    </div>
  );
};

export default CurrencyInput;
