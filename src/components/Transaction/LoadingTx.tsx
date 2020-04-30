import React from 'react';

import { useRootData } from 'hooks/useRootData';

import { ZK_EXPLORER } from 'constants/links';

import Spinner from 'components/Spinner/Spinner';

import './Transaction.scss';

interface ILoadingTXProps {
  addressValue: string;
  handleCancel: any;
  isLoading: boolean;
  inputValue: string;
  symbolName: string;
  setWalletName: any;
  title: string;
  unlockFau: any;
}

export const LoadingTx: React.FC<ILoadingTXProps> = ({
  inputValue,
  symbolName,
  addressValue,
  handleCancel,
  isLoading,
  setWalletName,
  title,
  unlockFau,
}): JSX.Element => {
  const { hintModal, unlocked, walletAddress } = useRootData(
    ({ hintModal, unlocked, walletAddress }) => ({
      unlocked: unlocked.get(),
      hintModal: hintModal.get(),
      walletAddress: walletAddress.get(),
    }),
  );

  const info = hintModal?.split('\n');

  return (
    <>
      {isLoading && !hintModal.match(/(?:denied)/i) && (
        <>
          <button
            onClick={() => {
              handleCancel();
            }}
            className='transaction-back'
          ></button>
          <h2 className='transaction-title'>
            {isLoading && !unlockFau ? 'Unlocking' : title}
          </h2>
          <Spinner />
          {title !== 'Send' && <p>{info[0]}</p>}
          {title === 'Send' && (
            <span className='transaction-field-title'>
              <span>{'Recepient:'}</span>
              <p>{walletAddress.length > 0 && walletAddress[0]}</p>
              <p>{addressValue}</p>
            </span>
          )}
          <span className='transaction-field-title'>
            {title === 'Send' && 'Amount + fee'}
            {title === 'Withdraw' && 'Amount'}
            {title === 'Deposit' && 'Amount:'}
            <p className='transaction-field-amount'>
              {inputValue} {symbolName}
            </p>
          </span>
          <p className='transaction-hash'>
            <a target='_blank' href={`${ZK_EXPLORER}/${info[2]}`}>
              {'Link to transaction'}
            </a>
          </p>
        </>
      )}
      {unlocked === undefined && (
        <>
          <Spinner />
          <button
            className='btn submit-button'
            onClick={() => {
              handleCancel();
              setWalletName();
            }}
          >
            {'Cancel'}
          </button>
        </>
      )}
    </>
  );
};
