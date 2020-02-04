import React, { useCallback, useState } from 'react';

import { Button, Input, InputNumber, Select, Spin } from 'antd';

import { ITransactionProps } from './Types';

import { useRootData } from '../../hooks/useRootData';

import { DEFAULT_ERROR } from '../../constants/errors';

const { Option } = Select;

const Transaction: React.FC<ITransactionProps> = ({
  addressValue,
  amountValue,
  balances,
  hash,
  isExecuted,
  isInput,
  isLoading,
  onCancel,
  openModal,
  onChangeAddress,
  onChangeAmount,
  title,
  transactionAction,
}): JSX.Element => {
  const [token, setToken] = useState<string>('');

  const { setError } = useRootData(({ setError }) => ({
    setError,
  }));
  const handleSave = useCallback(() => {
    try {
      if (addressValue) {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const newContacts = JSON.stringify([addressValue, ...contacts]);
        localStorage.setItem('contacts', newContacts);
      }
    } catch (err) {
      err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
    }
  }, [addressValue, setError]);

  const maxValue = balances?.filter(({ address, symbol }) => (+address ? address === token : symbol === token));

  return (
    <>
      {isExecuted ? (
        <>
          <p>{typeof hash === 'string' ? hash : hash?.hash}</p>
          <Button onClick={onCancel && openModal ? () => onCancel(openModal) : undefined}>Nice!</Button>
        </>
      ) : (
        <>
          {isLoading ? (
            <Spin tip="Loading..." />
          ) : (
            <>
              {isInput && (
                <>
                  <Input value={addressValue} onChange={onChangeAddress} />
                  <Button onClick={handleSave}>Save as a contacts</Button>
                </>
              )}
              {balances?.length && (
                <Select style={{ width: 200 }} onChange={value => setToken(value.toString())}>
                  {balances.map(({ address, balance, symbol }) => (
                    <Option key={address} value={+address ? address : symbol}>
                      {symbol}&nbsp;{balance}
                    </Option>
                  ))}
                </Select>
              )}
              <InputNumber
                min={0}
                max={maxValue && maxValue?.[0] ? +maxValue?.[0]?.balance : 0}
                value={amountValue}
                onChange={value => onChangeAmount(value)}
                step={0.1}
              />
              <Button onClick={() => transactionAction(token)}>{title}</Button>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Transaction;
