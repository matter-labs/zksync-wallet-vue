import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';
import { BackButton } from 'src/components/Common/BackButton';
import Spinner from 'components/Spinner/Spinner';

import { handleFormatToken, handleExponentialNumbers } from 'src/utils';

import './Transaction.scss';

interface ILockedTx {
  handleCancel: () => void;
  handleUnlock: () => void;
  handleSelectBalance: () => void;
  symbolName: string;
}

export const LockedTx: React.FC<ILockedTx> = observer(
  ({ handleCancel, handleUnlock, handleSelectBalance }): JSX.Element => {
    const store = useStore();

    const [conditionError, setConditionError] = useState<string>('');

    const { TransactionStore } = store;

    const history = useHistory();

    const formattedFee =
      store.zkWallet &&
      TransactionStore.symbolName &&
      TransactionStore.changePubKeyFees[TransactionStore.symbolName] &&
      handleFormatToken(
        store.zkWallet,
        TransactionStore.symbolName,
        TransactionStore.changePubKeyFees[TransactionStore.symbolName],
      );
    const feePrice = formattedFee &&
      store.price &&
      TransactionStore.symbolName && (
        <span className='md-font'>{` ~$${(
          +store.price[TransactionStore.symbolName] * +formattedFee
        ).toFixed(2)}`}</span>
      );

    const _cpkKeys = Object.keys(TransactionStore.changePubKeyFees);

    useEffect(() => {
      if (
        !store.zkWallet ||
        !store.zkBalancesLoaded ||
        _cpkKeys.length < store.zkBalances.length
      )
        return;
      handleSelectBalance();
    }, [
      store.zkWallet,
      store.zkBalancesLoaded,
      TransactionStore.changePubKeyFees,
    ]);

    useEffect(() => {
      if (TransactionStore.maxValue < +formattedFee) {
        setConditionError('Not enough balance :(');
      }
      if (!TransactionStore.symbolName) {
        setConditionError('Please select a token');
      }
      if (
        TransactionStore.symbolName &&
        TransactionStore.maxValue > +formattedFee
      ) {
        setConditionError('');
      }
    }, [TransactionStore.symbolName]);

    const UnlockContent = observer(() => (
      <>
        <div>
          <p className='lg-font'>{'Token to cover verification costs:'}</p>
        </div>
        {TransactionStore.symbolName && (
          <div
            className='dropdown wide'
            onClick={() => (TransactionStore.isBalancesListOpen = true)}
          >
            <p className='dropdown-item lg-font'>
              {TransactionStore.symbolName}
              {' (Balance: '}
              {handleExponentialNumbers(TransactionStore.maxValue)}
              {')'}
            </p>
            <div className='arrow-select'></div>
          </div>
        )}
        {!!store.zkWallet &&
          !!TransactionStore.symbolName &&
          !!TransactionStore.changePubKeyFees[TransactionStore.symbolName] && (
            <div>
              <p className='lg-font'>
                {'Fee: '}
                {formattedFee} {TransactionStore.symbolName}
                {feePrice}
              </p>
            </div>
          )}
        <div className='error-container'>
          <p
            className={`error-text lg-font ${
              !!conditionError ? 'visible' : ''
            }`}
          >
            {conditionError}
          </p>
        </div>
      </>
    ));

    const loadingCondition =
      !store.zkWallet || _cpkKeys.length < store.zkBalances.length;

    return (
      <>
        <BackButton
          cb={() => {
            handleCancel();
            store.walletAddress = {};
            store.transactionType = undefined;
            history.push('/account');
            TransactionStore.symbolName = '';
          }}
        />
        <div className='info-block center'>
          <p className='lg-font'>
            {
              'To start using your account you need to register your public key once. This operation costs 5000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge proofs. Please bear with us!'
            }
          </p>
        </div>
        {loadingCondition ? <Spinner /> : <UnlockContent />}
        <button
          className={`btn submit-button ${!conditionError ? '' : 'disabled'}`}
          onClick={!conditionError ? handleUnlock : undefined}
        >
          <span
            className={`submit-label unlock ${!conditionError ? '' : 'locked'}`}
          ></span>
          {'Unlock'}
        </button>
      </>
    );
  },
);
