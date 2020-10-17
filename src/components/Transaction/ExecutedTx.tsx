import React, { useState, useEffect } from 'react';
import { ethers, utils } from 'ethers';
import { useHistory } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { observer } from 'mobx-react-lite';
import ReactTypingEffect from 'react-typing-effect';

import { useStore } from 'src/store/context';

import { LINKS_CONFIG } from 'src/config';

import './Transaction.scss';
import { LottiePlayer } from '../Common/LottiePlayer';
import successCheckmark from 'images/success-checkmark.json';
import { BackButton } from 'src/components/Common/BackButton';

interface IExecutedTxProps {
  fee?: string | null;
  price?: number;
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
    fee,
    hash,
    handleCancel,
    inputValue,
    price,
    setTransactionType,
    symbolName,
    title,
  }): JSX.Element => {
    const store = useStore();

    const [gasPrice, setGasPrice] = useState<any>(0);

    const { hint, walletAddress, TransactionStore } = store;

    const info = hint?.split('\n');

    const history = useHistory();

    useEffect(() => {
      ethers
        .getDefaultProvider(LINKS_CONFIG.network)
        .getGasPrice()
        .then(res => res)
        .then(data => {
          if (gasPrice === 0) {
            setGasPrice(data);
          }
        });
    }, []);

    const gasSpendOnETHTx = 21000;
    const gasSpendOnERC20Tx = 80000;
    const actualGasSpend =
      symbolName === 'ETH' ? gasSpendOnETHTx : gasSpendOnERC20Tx;

    const costFactor =
      store.price &&
      fee &&
      Math.ceil(
        (+utils.formatEther(+gasPrice * actualGasSpend) * +store.price['ETH']) /
          (+fee * +store.price[symbolName]),
      );
    const delay = Math.pow(10, 9);

    useEffect(() => {
      if (title === 'Transfer') {
        console.log(
          `Gas: (${+gasPrice} * ${actualGasSpend}):` +
            +gasPrice * actualGasSpend,
        );
        if (store.price)
          console.log('Ethereum price in USD' + store.price['ETH']);
        if (fee)
          console.log(
            'fee: ' +
              store.zkWallet?.provider.tokenSet.parseToken(symbolName, fee),
          );
        if (store.price)
          console.log('Token price in USD:' + store.price[symbolName]);
      }
    }, [gasPrice, title]);

    return (
      <>
        <BackButton
          cb={() => {
            handleCancel();
            history.push('/account');
            TransactionStore.symbolName = '';
          }}
        />
        <h2 className='transaction-title'>
          {title === 'Deposit' && 'Deposit initiated'}
          {title === 'Withdraw' && 'Withdrawal initiated'}
          {title === 'Transfer' && 'Transfer complete'}
        </h2>
        <p className='transaction-hash'>
          <a
            target='_blank'
            href={`${
              title === 'Deposit'
                ? `https://${LINKS_CONFIG.ethBlockExplorer}/tx`
                : `https://${LINKS_CONFIG.zkSyncBlockExplorer}/transactions`
            }/${typeof hash === 'string' ? hash : hash?.hash}`}
          >
            {'Link to the transaction '}
            <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
          </a>
        </p>
        <LottiePlayer src={JSON.stringify(successCheckmark)} />
        {title !== 'Transfer' && <p>{info[0]}</p>}
        {title === 'Transfer' && (
          <>
            <span className='transaction-field-title'>
              <span>{'Recepient:'}</span>
              <h3 className='truncate'>{walletAddress.name}</h3>
              <p>{addressValue}</p>
            </span>
            {!walletAddress.name && (
              <button
                className='btn submit-button transparent margin small'
                onClick={() => {
                  store.modalSpecifier = 'add-contact';
                  store.isContact = false;
                }}
              >
                {'Add to contacts'}
              </button>
            )}
          </>
        )}
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
        {title === 'Transfer' && (
          <div className='typing-wrapper'>
            {((costFactor !== 0 && !!costFactor) || symbolName === 'MLTT') && (
              <ReactTypingEffect
                text={
                  symbolName === 'ETH'
                    ? `On mainnet, this transaction would’ve been ${costFactor}x more expensive (${costFactor &&
                        costFactor * 4}x for an ERC20 token!)`
                    : symbolName === 'MLTT'
                    ? 'For other ERC20 tokens, a tx like this would be ~100x more expensive on mainnet!'
                    : `On mainnet, this transaction would’ve been ${costFactor}x more expensive!`
                }
                typingDelay={1000}
                eraseDelay={delay}
                cursor=''
                cursorClassName='typing-cursor'
                speed={30}
              />
            )}
          </div>
        )}

        <button
          className='btn submit-button margin'
          onClick={() => {
            handleCancel();
            store.walletAddress = {};
            store.transactionType = undefined;
            history.push('/account');
          }}
        >
          {'OK'}
        </button>
      </>
    );
  },
);
