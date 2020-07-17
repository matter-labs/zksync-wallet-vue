import React from 'react';
import { useHistory } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import Spinner from 'components/Spinner/Spinner';

import { LINKS_CONFIG } from 'src/config';

import './Transaction.scss';

interface ILoadingTXProps {
  addressValue: string;
  fee?: string | null;
  handleCancel: () => void;
  isAccountUnlockingProcess: boolean;
  isLoading: boolean;
  isUnlockingProcess: boolean;
  inputValue: string;
  price?: number;
  symbolName: string;
  setWalletName: any;
  setUnlockingERCProcess: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountUnlockingProcess: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  unlockFau: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

library.add(fas);

export const LoadingTx: React.FC<ILoadingTXProps> = observer(
  ({
    fee,
    inputValue,
    price,
    symbolName,
    addressValue,
    handleCancel,
    isLoading,
    title,
    isUnlockingProcess,
    isAccountUnlockingProcess,
    setUnlockingERCProcess,
    setAccountUnlockingProcess,
    setLoading,
  }): JSX.Element => {
    const store = useStore();

    const { hint, walletAddress } = store;

    const history = useHistory();

    const info = hint?.split('\n');

    const unlockingTitle = isAccountUnlockingProcess
      ? 'Unlocking account'
      : `Unlocking ${symbolName} token`;

    const propperTitle =
      isLoading &&
      (isAccountUnlockingProcess || isUnlockingProcess) &&
      store.zkWallet
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
        {info[2] && (
          <p className='transaction-hash'>
            <a
              target='_blank'
              href={`${
                title === 'Deposit'
                  ? `https://${LINKS_CONFIG.ethBlockExplorer}/tx`
                  : `https://${LINKS_CONFIG.zkSyncBlockExplorer}/transactions`
              }/${info[2]}`}
            >
              {'Link to the transaction '}
              <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
            </a>
          </p>
        )}
        <Spinner />
        {store.zkWallet && (
          <>
            <p>{info[0]}</p>
            {isAccountUnlockingProcess && (
              <div className={`hint-walleticon ${store.walletName}`}>
                {store.walletName === 'Web3' && (
                  <FontAwesomeIcon icon={['fas', 'globe']} />
                )}
              </div>
            )}
          </>
        )}
        {title === 'Transfer' &&
          !isAccountUnlockingProcess &&
          store.unlocked !== undefined &&
          store.zkBalancesLoaded && (
            <>
              <span className='transaction-field-title'>
                <span>{'Recepient:'}</span>
                <h3>{walletAddress.name}</h3>
                <p>{addressValue}</p>
              </span>
              {!walletAddress.name && (
                <button
                  className='btn submit-button transparent margin small'
                  onClick={() => {
                    store.isContact = false;
                    store.modalSpecifier = 'add-contact';
                  }}
                >
                  {'Add to contacts'}
                </button>
              )}
            </>
          )}
        {!isAccountUnlockingProcess &&
          !isUnlockingProcess &&
          store.unlocked !== undefined &&
          store.zkBalancesLoaded && (
            <>
              <span className='transaction-field-title row'>
                <span>
                  {title === 'Transfer' && 'Amount: '}
                  {title === 'Withdraw' && 'Amount: '}
                  {title === 'Deposit' && 'Amount: '}
                </span>
                <p className='transaction-field-amount'>
                  {inputValue} {symbolName}{' '}
                  <span className='transaction-field-price'>
                    {'~$'}
                    {price && (price * +inputValue).toFixed(2)}
                  </span>
                </p>
              </span>
              {title === 'Transfer' && (
                <span className='transaction-field-title row fee'>
                  <span>{title === 'Transfer' && 'Fee:'}</span>
                  <p className='transaction-field-amount'>
                    {fee} {symbolName}{' '}
                    <span className='transaction-field-price'>
                      {'~$'}
                      {price && fee && (price * +fee).toFixed(2)}
                    </span>
                  </p>
                </span>
              )}
            </>
          )}
        <button
          className='btn submit-button margin'
          onClick={() => {
            if (isAccountUnlockingProcess || isUnlockingProcess) {
              setLoading(false);
              setAccountUnlockingProcess(false);
              setUnlockingERCProcess(false);
            } else {
              handleCancel();
              history.goBack();
            }
          }}
        >
          {'Close'}
        </button>
      </>
    );
  },
);
