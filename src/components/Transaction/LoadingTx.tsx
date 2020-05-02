import React from 'react';
import { useHistory } from 'react-router-dom';

import { useRootData } from 'hooks/useRootData';

import Spinner from 'components/Spinner/Spinner';

import './Transaction.scss';

interface ILoadingTXProps {
  addressValue: string;
  handleCancel: () => void;
  isLoading: boolean;
  isUnlockingProcess: boolean;
  inputValue: string;
  symbolName: string;
  setWalletName: any;
  title: string;
  unlockFau: boolean;
}

export const LoadingTx: React.FC<ILoadingTXProps> = ({
  inputValue,
  symbolName,
  addressValue,
  handleCancel,
  isLoading,
  setWalletName,
  title,
  isUnlockingProcess,
}): JSX.Element => {
  const { hintModal, unlocked, walletAddress } = useRootData(
    ({ hintModal, unlocked, walletAddress }) => ({
      unlocked: unlocked.get(),
      hintModal: hintModal.get(),
      walletAddress: walletAddress.get(),
    }),
  );

  const history = useHistory();

  const info = hintModal?.split('\n');

  return (
    <>
      {isLoading && !hintModal.match(/(?:denied)/i) && (
        <>
          <button
            onClick={() => {
              handleCancel();
              history.push('/account');
            }}
            className='transaction-back'
          ></button>
          <h2 className='transaction-title'>
            {isLoading && isUnlockingProcess ? 'Unlocking' : title}
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
          <button
            className='btn submit-button'
            onClick={() => {
              handleCancel();
            }}
          >
            {'Cancel'}
          </button>
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
