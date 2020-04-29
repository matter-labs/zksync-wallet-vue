import React from 'react';

import { useRootData } from 'hooks/useRootData';

import Spinner from 'components/Spinner/Spinner';

import './Transaction.scss';

interface ILoadingTXProps {
  handleCancel: any;
  isLoading: any;
  setWalletName: any;
  title: string;
  unlockFau: any;
}

export const LoadingTx: React.FC<ILoadingTXProps> = ({
  handleCancel,
  isLoading,
  setWalletName,
  title,
  unlockFau,
}): JSX.Element => {
  const { hintModal, unlocked } = useRootData(({ hintModal, unlocked }) => ({
    unlocked: unlocked.get(),
    hintModal: hintModal.get(),
  }));

  return (
    <>
      {isLoading && !hintModal.match(/(?:denied)/i) && (
        <>
          <h1>{isLoading && !unlockFau ? 'Unlocking' : title}</h1>
          {!!hintModal
            ? hintModal?.split('\n').map((text, key) => (
                <p className='transaction-hint' key={key}>
                  {text}
                </p>
              ))
            : 'Follow the instructions in the pop up'}

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
