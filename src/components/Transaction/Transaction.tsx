import React, { useCallback } from 'react';

import { Button, Input, InputNumber, Spin } from 'antd';

import { ITransactionProps } from './Types';

const Transaction: React.FC<ITransactionProps> = ({
  addressValue,
  amountValue,
  asset,
  balance,
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
  const handleSave = useCallback(() => {
    if (addressValue) {
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      const newContacts = JSON.stringify([addressValue, ...contacts]);
      localStorage.setItem('contacts', newContacts);
    }
  }, [addressValue]);

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
              <span>
                {asset} &nbsp;{balance}
              </span>
              <InputNumber
                min={0}
                max={+balance}
                value={amountValue}
                onChange={value => onChangeAmount(value)}
                step={0.1}
              />
              <Button onClick={transactionAction}>{title}</Button>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Transaction;
