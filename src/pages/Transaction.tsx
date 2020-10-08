import React, { FC, useState, useRef, useCallback } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';

import { Tx } from './Transactions';
import { TxStatus } from 'src/components/Transaction/TxStatus';
import { useStore } from 'src/store/context';

import { LINKS_CONFIG } from 'src/config';
import {
  formatDate,
  handleFormatToken,
  handleExponentialNumbers,
} from 'src/utils';

library.add(fas);

export const Transaction: FC<Tx> = props => {
  const {
    hash,
    tx: { amount, from, priority_op, type, to, token },
    created_at,
  } = props;
  const store = useStore();
  const history = useHistory();

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);

  const contacts = JSON.parse(
    window.localStorage?.getItem(`contacts${store.zkWallet?.address()}`) ||
      '[]',
  );

  const handleCopy = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el?.focus();
    el?.select();
    document.execCommand('copy');
    openCopyModal(true);
  }, [ref, openCopyModal]);

  const handleFindContactName = (to, from, reciever) => {
    if (reciever && to && from) {
      return contacts?.filter(
        c => c?.address?.toLowerCase() === from?.toLowerCase(),
      )[0];
    } else {
      return contacts?.filter(
        c => c?.address?.toLowerCase() === to?.toLowerCase(),
      )[0];
    }
  };

  const nameHandler = handleFindContactName(
    to,
    from,
    to?.toLowerCase() === store.zkWalletAddress?.toLowerCase(),
  )?.name;

  const addressAppearence = nameHandler
    ? nameHandler
    : to?.toLowerCase() === store.zkWalletAddress?.toLowerCase()
    ? from?.replace(from?.slice(6, from?.length - 3), '...')
    : to?.replace(to?.slice(6, to?.length - 3), '...');

  return (
    <div className='transaction-history-wrapper' key={hash}>
      <TxStatus tx={props} />
      <div className='transaction-history-left'>
        <div className='transaction-history-date'>
          {formatDate(created_at).toLocaleString()}
        </div>
        <div>
          <div className={`transaction-history ${type}`}>
            <div className='transaction-history-amount'>
              {store.zkWallet &&
                (!!amount || !!priority_op?.amount
                  ? handleExponentialNumbers(
                      +handleFormatToken(
                        store.zkWallet,
                        type === 'Deposit'
                          ? (priority_op?.token as string)
                          : (token as string),
                        type === 'Deposit' && priority_op
                          ? +priority_op.amount
                          : +amount,
                      ),
                    )
                  : 'Unlocking transaction')}
            </div>
            <div className='transaction-history-hash'>
              {token && token.toString().length > 10
                ? token
                    .toString()
                    .replace(
                      token.toString().slice(6, token.toString().length - 3),
                      '...',
                    )
                : type === 'Deposit'
                ? priority_op?.token
                : token}
            </div>
          </div>
        </div>{' '}
      </div>
      <input
        type='text'
        readOnly
        className='copy-block-input'
        value={hash.toString()}
        ref={ref}
      />
      <div className='transaction-history-right'>
        <div className='transaction-history-address'>
          {type === 'Transfer' && (
            <>
              <span>
                {to?.toLowerCase() === store.zkWalletAddress?.toLowerCase()
                  ? 'Received from:'
                  : 'Sent to:'}
              </span>
              <p
                className='pointer undo-btn'
                onClick={e => {
                  e.stopPropagation();
                  store.walletAddress = {
                    name: nameHandler ? nameHandler : '',
                    address:
                      to?.toLowerCase() === store.zkWalletAddress?.toLowerCase()
                        ? from
                        : to,
                  };
                  history.push(
                    `/contacts/${(to?.toLowerCase() ===
                    store.zkWalletAddress?.toLowerCase()
                      ? from
                      : to
                    )?.toLowerCase()}`,
                  );
                }}
              >
                {addressAppearence}
              </p>
            </>
          )}
          {type === 'Deposit' && (
            <>
              <span>{'Deposit to:'}</span>
              <p>{'Your account'}</p>
            </>
          )}
          {type === 'Withdraw' && (
            <>
              <span>{'Withdrawn to:'}</span>
              <p
                className='pointer undo-btn'
                onClick={e => {
                  e.stopPropagation();
                  store.walletAddress = {
                    name: nameHandler ? nameHandler : '',
                    address:
                      to?.toLowerCase() === store.zkWalletAddress?.toLowerCase()
                        ? from
                        : to,
                  };
                  history.push(
                    `/contacts/${(to?.toLowerCase() ===
                    store.zkWalletAddress?.toLowerCase()
                      ? from
                      : to
                    )?.toLowerCase()}`,
                  );
                }}
              >
                {to?.replace(to?.slice(6, to?.length - 3), '...')}
              </p>
            </>
          )}
        </div>
      </div>
      <a
        className={`contact-manage-copy copy-block-button btn-tr ${
          isCopyModal ? 'copied' : ''
        }`}
        title='View in block explorer'
        target='_blank'
        href={`${
          type === 'Deposit'
            ? `https://${LINKS_CONFIG.ethBlockExplorer}/tx`
            : `https://${LINKS_CONFIG.zkSyncBlockExplorer}/transactions`
        }/${hash}`}
      >
        <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
      </a>
    </div>
  );
};
