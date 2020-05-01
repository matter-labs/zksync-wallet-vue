import React from 'react';

import { useRootData } from 'hooks/useRootData';

import Spinner from 'components/Spinner/Spinner';

import './Transaction.scss';

interface ICanceledTxProps {
  handleCancel: () => void;
  setWalletName: () => void;
}

export const CanceledTx: React.FC<ICanceledTxProps> = ({
  handleCancel,
  setWalletName,
}): JSX.Element => {
  const {
    hintModal,
    setHintModal,
    setTransactionType,
    setWalletAddress,
  } = useRootData(
    ({ hintModal, setHintModal, setTransactionType, setWalletAddress }) => ({
      setHintModal,
      setTransactionType,
      setWalletAddress,
      hintModal: hintModal.get(),
    }),
  );

  return (
    <>
      <button
        onClick={() => {
          handleCancel();
          setWalletAddress([]);
          setTransactionType(undefined);
          setWalletName();
          setHintModal('');
        }}
        className='transaction-back'
      ></button>
      <h1>{'Transaction canceled'}</h1>
      <p>{hintModal}</p>
    </>
  );
};
