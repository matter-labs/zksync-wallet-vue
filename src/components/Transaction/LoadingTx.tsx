import React from 'react';
import { useHistory } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';
import { BackButton } from 'src/components/Common/BackButton';

import Spinner from 'components/Spinner/Spinner';

import { LINKS_CONFIG } from 'src/config';

import './Transaction.scss';

interface ILoadingTXProps {
  fee?: string | null;
  feeToken: string;
  handleCancel: () => void;
  isUnlockingProcess: boolean;
  inputValue: string;
  setWalletName: any;
  setUnlockingERCProcess: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  unlockFau: boolean;
}

library.add(fas);

export const LoadingTx: React.FC<ILoadingTXProps> = observer(
  ({
    fee,
    inputValue,
    handleCancel,
    feeToken,
    title,
    isUnlockingProcess,
    setUnlockingERCProcess,
  }): JSX.Element => {
    const store = useStore();

    const {
      hint,
      walletAddress,
      TransactionStore,
      AccountStore,
      TokensStore,
    } = store;

    const history = useHistory();

    const info = hint?.split('\n');

    const unlockingTitle = AccountStore?.isAccountUnlockingProcess
      ? 'Unlocking account'
      : `Unlocking ${TransactionStore?.symbolName} token`;

    const propperTitle =
      TransactionStore.isLoading &&
      (AccountStore.isAccountUnlockingProcess || isUnlockingProcess) &&
      store.zkWallet
        ? unlockingTitle
        : title;

    return (
      <>
        <BackButton
          cb={() => {
            handleCancel();
            history.push('/account');
            TransactionStore.symbolName = '';
          }}
        />
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
        {!store.isExternalWallet && <Spinner />}
        {store.zkWallet && (
          <>
            <p>
              {info[0] !== 'Connecting to ' &&
                info[0] !== 'Connected to ' &&
                info[0]}
            </p>
            {AccountStore.isAccountUnlockingProcess && (
              <div className={`hint-walleticon ${store.walletName}`}>
                {store.walletName === 'Web3' && (
                  <FontAwesomeIcon icon={['fas', 'globe']} />
                )}
              </div>
            )}
          </>
        )}
        {title === 'Transfer' &&
          !AccountStore.isAccountUnlockingProcess &&
          store.unlocked !== undefined &&
          TokensStore.zkBalancesLoaded && (
            <>
              <span className='transaction-field-title'>
                <span>{'Recepient:'}</span>
                <h3>{walletAddress.name}</h3>
                <p>{TransactionStore.recepientAddress}</p>
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
        {!AccountStore.isAccountUnlockingProcess &&
          !isUnlockingProcess &&
          store.unlocked !== undefined &&
          TokensStore.zkBalancesLoaded && (
            <>
              <span className='transaction-field-title row'>
                <span>
                  {title === 'Transfer' && 'Amount: '}
                  {title === 'Withdraw' && 'Amount: '}
                  {title === 'Deposit' && 'Amount: '}
                </span>
                <p className='transaction-field-amount'>
                  {inputValue} {TransactionStore.symbolName}{' '}
                  <span className='transaction-field-price'>
                    {'~$'}
                    {TokensStore.tokenPrices &&
                      TokensStore.tokenPrices[TransactionStore.symbolName] &&
                      (
                        +TokensStore.tokenPrices[TransactionStore.symbolName] *
                        +inputValue
                      ).toFixed(2)}
                  </span>
                </p>
              </span>
              {title === 'Transfer' && (
                <span className='transaction-field-title row fee'>
                  <span>{title === 'Transfer' && 'Fee:'}</span>
                  <p className='transaction-field-amount'>
                    {fee} {feeToken}{' '}
                    <span className='transaction-field-price'>
                      {'~$'}
                      {TokensStore.tokenPrices &&
                        TokensStore.tokenPrices[feeToken] &&
                        fee &&
                        (+TokensStore.tokenPrices[feeToken] * +fee).toFixed(2)}
                    </span>
                  </p>
                </span>
              )}
            </>
          )}
        <button
          className='btn submit-button margin'
          onClick={() => {
            if (AccountStore.isAccountUnlockingProcess || isUnlockingProcess) {
              TransactionStore.isLoading = false;
              AccountStore.isAccountUnlockingProcess = false;
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
