import React from 'react';

import { useStore } from 'src/store/context';
import 'src/components/Transaction/Transaction.scss';

interface IBackButtonProps {
  cb: () => void;
}

export const BackButton: React.FC<IBackButtonProps> = ({ cb }): JSX.Element => {
  const store = useStore();

  return (
    <>
      {!store.isExternalWallet && (
        <button onClick={cb} className='transaction-back'></button>
      )}
    </>
  );
};
