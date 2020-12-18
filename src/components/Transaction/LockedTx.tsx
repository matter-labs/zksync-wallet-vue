import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';
import { BackButton } from 'src/components/Common/BackButton';
import Spinner from 'components/Spinner/Spinner';

import { handleFormatToken, handleExponentialNumbers } from 'src/utils';

import './Transaction.scss';

interface ILockedTxNew {
  handleCancel: () => void;
  handleUnlock: () => void;
  handleSelectBalance: () => void;
  symbolName: string;
}

export const LockedTxNew: React.FC<ILockedTxNew> = observer(
  ({ handleCancel, handleUnlock, handleSelectBalance }): JSX.Element => {
    const store = useStore();

    const [conditionError, setConditionError] = useState<string>('');

    const { TransactionStore, TokensStore } = store;

    const history = useHistory();

    const formattedFee =
      store.zkWallet &&
      TransactionStore.symbolName &&
      TransactionStore.changePubKeyFees[TransactionStore.symbolName] &&
      handleFormatToken(store.zkWallet, TransactionStore.symbolName, TransactionStore.changePubKeyFees[TransactionStore.symbolName]);
    const feePrice = formattedFee &&
      TokensStore.tokenPrices &&
      TransactionStore.symbolName && (
        <span className='md-font'>{` ~$${(
          +TokensStore.tokenPrices[TransactionStore.symbolName] * +formattedFee
        ).toFixed(2)}`}</span>
      );

    const _cpkKeys = Object.keys(TransactionStore.changePubKeyFees);

    useEffect(() => {
      if (
        !store.zkWallet ||
        !TokensStore.zkBalancesLoaded ||
        _cpkKeys.length < TokensStore.zkBalances.length
      )
        return;
      handleSelectBalance();
    }, [
      store.zkWallet,
      TokensStore.zkBalancesLoaded,
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
              conditionError ? 'visible' : ''
            }`}
          >
            {conditionError}
          </p>
        </div>
      </>
    ));

    const loadingCondition =
      !store.zkWallet || _cpkKeys.length < TokensStore.zkBalances.length;

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
        <h2 className='transaction-title'>{'Unlock account'}</h2>
        <div className='info-block'>
          <p className='lg-font'>
            {
              'To start using your account you need to register your public key once. This operation costs 15000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge proofs. Please bear with us!'
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
