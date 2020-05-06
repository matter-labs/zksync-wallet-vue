import React from 'react';
import { useHistory } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { useRootData } from 'hooks/useRootData';

import Spinner from 'components/Spinner/Spinner';

import { ZK_EXPLORER, ETHERSCAN_EXPLORER } from 'constants/links';

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
  title: string;
  unlockFau: boolean;
}

library.add(fas);

export const LoadingTx: React.FC<ILoadingTXProps> = ({
  inputValue,
  symbolName,
  addressValue,
  handleCancel,
  isLoading,
  setWalletName,
  title,
  isUnlockingProcess,
  isAccountUnlockingProcess,
}): JSX.Element => {
  const { hint, unlocked, walletAddress } = useRootData(
    ({ hint, unlocked, walletAddress }) => ({
      unlocked: unlocked.get(),
      hint: hint.get(),
      walletAddress: walletAddress.get(),
    }),
  );

  const history = useHistory();

  const info = hint?.split('\n');

  return (
    <>
      {isLoading && !hint.match(/(?:denied)/i) && (
        <>
          <button
            onClick={() => {
              handleCancel();
              history.push('/account');
            }}
            className='transaction-back'
          ></button>
          <h2 className='transaction-title'>
            {isLoading && (isAccountUnlockingProcess || isUnlockingProcess)
              ? 'Unlocking'
              : title}
          </h2>
          <Spinner />
          <p>{info[0]}</p>
          {title === 'Send' && !isAccountUnlockingProcess && (
            <span className='transaction-field-title'>
              <span>{'Recepient:'}</span>
              <p>{walletAddress.length > 0 && walletAddress[0]}</p>
              <p>{addressValue}</p>
            </span>
          )}
          {!isAccountUnlockingProcess && !isUnlockingProcess && (
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
                  title === 'Deposit' ? ETHERSCAN_EXPLORER : ZK_EXPLORER
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
              handleCancel();
              history.push('/account');
            }}
          >
            {'Cancel'}
          </button>
        </>
      )}
    </>
  );
};
