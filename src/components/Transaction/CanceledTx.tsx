import React from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';
import { BackButton } from 'src/components/Common/BackButton';

import './Transaction.scss';

interface ICanceledTxProps {
  handleCancel: () => void;
  setWalletName: () => void;
}

export const CanceledTx: React.FC<ICanceledTxProps> = observer(
  ({ handleCancel, setWalletName }): JSX.Element => {
    const store = useStore();

    const { hint } = store;

    const history = useHistory();

    return (
      <>
        <BackButton
          cb={() => {
            handleCancel();
            store.walletAddress = {};
            store.transactionType = undefined;
            setWalletName();
            store.hint = '';
            history.push('/account');
          }}
        />
        <h1>{'Transaction canceled'}</h1>
        <p>{hint}</p>
      </>
    );
  },
);
