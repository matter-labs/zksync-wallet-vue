import React from 'react';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import { ZK_EXPLORER, ETHERSCAN_EXPLORER } from 'constants/links';

import './Transaction.scss';
import { LottiePlayer } from '../Common/LottiePlayer';
import successCheckmark from 'images/success-checkmark.json';

interface IExecutedTxProps {
  addressValue: string;
  handleCancel: () => void;
  hash: string | ethers.ContractTransaction | undefined;
  inputValue: string;
  setTransactionType: (
    transaction: 'deposit' | 'withdraw' | 'transfer' | undefined,
  ) => void;
  symbolName: string;
  title: string;
}

library.add(fas);

export const ExecutedTx: React.FC<IExecutedTxProps> = observer(
  ({
    addressValue,
    hash,
    handleCancel,
    inputValue,
    setTransactionType,
    symbolName,
    title,
  }): JSX.Element => {
    const store = useStore();

    const { hint, walletAddress } = store;

    const info = hint?.split('\n');

    const history = useHistory();

    return (
      <>
        <button
          onClick={() => {
            handleCancel();
            history.push('/account');
          }}
          className='transaction-back'
        ></button>
        <h2 className='transaction-title'>
          {title === 'Deposit' && 'Deposit initiated'}
          {title === 'Withdraw' && 'Withdrawal initiated'}
          {title === 'Send' && 'Transfer complete'}
        </h2>
        <LottiePlayer src={JSON.stringify(successCheckmark)} />
        {title !== 'Send' && <p>{info[0]}</p>}
        {title === 'Send' && (
          <span className='transaction-field-title'>
            {'Recepient:'}
            <h3>{walletAddress.name && walletAddress.name}</h3>
            <p>{addressValue}</p>
          </span>
        )}
        <span className='transaction-field-title'>
          {title === 'Send' && 'Amount + fee'}
          {title === 'Withdraw' && 'Withdrawn'}
          {title === 'Deposit' && 'Deposited:'}
          <p className='transaction-field-amount'>
            {inputValue} {symbolName}
          </p>
        </span>
        <p className='transaction-hash'>
          <a
            target='_blank'
            href={`${title === 'Deposit' ? ETHERSCAN_EXPLORER : ZK_EXPLORER}/${
              typeof hash === 'string' ? hash : hash?.hash
            }`}
          >
            {'Link to the transaction '}
            <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
          </a>
        </p>
        <button
          className='btn submit-button'
          onClick={() => {
            handleCancel();
            store.walletAddress = {};
            setTransactionType(undefined);
            history.push('/account');
          }}
        >
          {'OK'}
        </button>
      </>
    );
  },
);
