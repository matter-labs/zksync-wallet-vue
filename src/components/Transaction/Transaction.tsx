import React, { useState } from 'react';

import SaveContacts from '../SaveContacts/SaveContacts';

import { Button, Input, InputNumber, Select, Spin } from 'antd';

import { ITransactionProps } from './Types';

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
  type,
}): JSX.Element => {
  const [isSaveModalOpen, openSaveModal] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');

  const maxValue = balances?.filter(({ address, symbol }) => (+address ? address === token : symbol === token));

  return (
    <>
      <SaveContacts address={addressValue} isModalOpen={isSaveModalOpen} canceslModal={() => openSaveModal(false)} />
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
                  <Button onClick={() => openSaveModal(true)}>Save as a contacts</Button>
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
              <Button onClick={() => transactionAction(token, type)}>{title}</Button>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Transaction;
