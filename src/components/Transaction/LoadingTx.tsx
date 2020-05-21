import React from 'react';
import { useHistory } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import Spinner from 'components/Spinner/Spinner';

import { LINKS_CONFIG } from 'constants/links';

import './Transaction.scss';

interface ILoadingTXProps {
  addressValue: string;
  handleCancel: () => void;
  isAccountUnlockingProcess: boolean;
  isLoading: boolean;
  isUnlockingProcess: boolean;
  inputValue: string;
  symbolName: string;
  setWalletName: any;
  setUnlockingProcess: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountUnlockingProcess: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  unlockFau: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

library.add(fas);

export const LoadingTx: React.FC<ILoadingTXProps> = observer(
  ({
    inputValue,
    symbolName,
    addressValue,
    handleCancel,
    isLoading,
    title,
    isUnlockingProcess,
    isAccountUnlockingProcess,
    setUnlockingProcess,
    setAccountUnlockingProcess,
    setLoading,
  }): JSX.Element => {
    const store = useStore();

    const { hint, walletAddress } = store;

    const history = useHistory();

    const info = hint?.split('\n');

    const unlockingTitle = isAccountUnlockingProcess
      ? 'Unlock account'
      : `Unlock ${symbolName} token`;

    const propperTitle =
      isLoading && (isAccountUnlockingProcess || isUnlockingProcess)
        ? unlockingTitle
        : title;

    return (
      <>
        <button
          onClick={() => {
            handleCancel();
            history.push('/account');
          }}
          className='transaction-back'
        ></button>
        <h2 className='transaction-title'>{propperTitle}</h2>
        <Spinner />
        <p>{info[0]}</p>
        {title === 'Send' &&
          !isAccountUnlockingProcess &&
          store.unlocked !== undefined && (
            <span className='transaction-field-title'>
              <span>{'Recepient:'}</span>
              <p>{walletAddress.name && walletAddress.name}</p>
              <p>{addressValue}</p>
            </span>
          )}
        {!isAccountUnlockingProcess &&
          !isUnlockingProcess &&
          store.unlocked !== undefined && (
            <span className='transaction-field-title'>
              {title === 'Send' && 'Amount + fee'}
              {title === 'Withdraw' && 'Amount'}
              {title === 'Deposit' && 'Amount:'}
              <p className='transaction-field-amount'>
                {inputValue} {symbolName}
              </p>
            </span>
          )}
        {info[2] && (
          <p className='transaction-hash'>
            <a
              target='_blank'
              href={`${
                title === 'Deposit'
                  ? `https://${LINKS_CONFIG.STAGE_ZKSYNC.ethBlockExplorer}/tx`
                  : `https://${LINKS_CONFIG.STAGE_ZKSYNC.zkSyncBlockExplorer}/transactions`
              }/${info[2]}`}
            >
              {'Link to the transaction '}
              <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
            </a>
          </p>
        )}

        <button
          className='btn submit-button'
          onClick={() => {
            if (!isAccountUnlockingProcess || !isUnlockingProcess) {
              setLoading(false);
              setAccountUnlockingProcess(false);
              setUnlockingProcess(false);
            } else {
              handleCancel();
              history.push('/account');
            }
          }}
        >
          {'Close'}
        </button>
      </>
    );
  },
);
