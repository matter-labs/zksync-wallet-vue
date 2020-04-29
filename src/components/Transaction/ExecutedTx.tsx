import React from 'react';

import { useRootData } from 'hooks/useRootData';

import { ZK_EXPLORER } from 'constants/links';

import './Transaction.scss';

interface IExecutedTxProps {
  handleCancel: any;
  hash: any;
  inputValue: any;
  setTransactionType: any;
  symbolName: any;
  title: string;
}

export const ExecutedTx: React.FC<IExecutedTxProps> = ({
  hash,
  handleCancel,
  inputValue,
  setTransactionType,
  symbolName,
  title,
}): JSX.Element => {
  const { setWalletAddress } = useRootData(({ setWalletAddress }) => ({
    setWalletAddress,
  }));

  return (
    <>
      <button
        onClick={() => {
          handleCancel();
        }}
        className='transaction-back'
      ></button>
      <h2 className='transaction-title'>
        {title} {title === 'Withdraw' ? 'initiated' : 'successful!'}
      </h2>
      <span className='transaction-field-title'>
        {title === 'Send' && <>{'Transfered into'}</>}
        {title === 'Withdraw' && <>{'Withdrawn from'}</>}
        {title === 'Deposit' && <>{'Deposited to'}</>} {'zkSync: '}
        <p className='transaction-field-amount'>
          {inputValue} {symbolName}
        </p>
      </span>
      <p className='transaction-hash'>
        {'Tx hash: '}
        <a
          target='_blank'
          href={`${ZK_EXPLORER}/${
            typeof hash === 'string' ? hash : hash?.hash
          }`}
        >
          {typeof hash === 'string' ? hash : hash?.hash}
        </a>
      </p>
      <button
        className='btn submit-button'
        onClick={() => {
          handleCancel();
          setWalletAddress([]);
          setTransactionType(undefined);
        }}
      >
        {'Go to my wallet'}
      </button>
    </>
  );
};
