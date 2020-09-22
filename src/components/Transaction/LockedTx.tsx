import React from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';
import { BackButton } from 'src/components/Common/BackButton';

import './Transaction.scss';

interface ILockedTx {
  handleCancel: () => void;
  handleUnlock: () => void;
}

export const LockedTx: React.FC<ILockedTx> = observer(
  ({ handleCancel, handleUnlock }): JSX.Element => {
    const store = useStore();

    const history = useHistory();

    return (
      <>
        <BackButton
          cb={() => {
            handleCancel();
            store.walletAddress = {};
            store.transactionType = undefined;
            history.push('/account');
          }}
        />
        <div className='info-block center'>
          <p>
            {
              'To control your account you need to unlock it once by registering your public key.'
            }
          </p>
        </div>
        <button className='btn submit-button' onClick={handleUnlock}>
          <span className='submit-label unlock'></span>
          {'Unlock'}
        </button>
      </>
    );
  },
);
