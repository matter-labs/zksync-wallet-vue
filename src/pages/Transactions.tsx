import React, { useCallback, useMemo, useState } from 'react';

import { DataList } from 'components/DataList/DataListNew';
import { ZK_EXPLORER } from 'constants/links';
import { useRootData } from 'hooks/useRootData';
import { useTimeout } from 'hooks/timers';
import { Transition } from 'components/Transition/Transition';
import { useCheckLogin } from 'hooks/useCheckLogin';

interface Tx {
  hash: string;
  pq_id?: any;
  tx: {
    amount: string;
    fee: string;
    from: string;
    nonce: number;
    priority_op?: {
      amount: string;
      from: string;
      to: string;
      token: number;
    };
    signature: {
      pubKey: string;
      signature: string;
    };
    to?: string;
    token?: number;
    type: 'Transfer' | 'Withdraw' | 'Deposit';
  };
  success: boolean;
  fail_reason?: any;
  commited: boolean;
  verified: boolean;
}

const Transactions: React.FC = (): JSX.Element => {
  const { zkWallet } = useRootData(
    ({ ethId, provider, searchTransactions, zkWallet }) => ({
      ethId: ethId.get(),
      provider: provider.get(),
      searchTransactions: searchTransactions.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const fetchTransactions = (amount, offset): Promise<Tx[]> =>
    fetch(
      `https://testnet.zksync.dev/api/v0.1/account/${zkWallet?.address()}/history/${offset}/${amount}`,
    ).then(r => r.json());

  const [isCopyModal, openCopyModal] = useState<boolean>(false);

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(() => {
    inputRef.map(el => {
      if (el?.value) {
        el?.focus();
        el?.select();
        document.execCommand('copy');
      }
    });
    openCopyModal(true);
    setTimeout(() => openCopyModal(false), 200);
  }, [inputRef]);

  useTimeout(() => isCopyModal && openCopyModal(false), 2000);

  useCheckLogin();

  return (
    <DataList
      onFetch={fetchTransactions}
      title='Transactions'
      visible={true}
      onSort={arr => arr.reverse()}
      renderItem={({ hash, tx: { amount, priority_op, type, to, token } }) => (
        <div className='transaction-history-wrapper' key={hash}>
          <div className='transaction-history-left'>
            <div className={`transaction-history ${type}`}></div>
            <div className='transaction-history-amount'>
              {parseFloat(
                (
                  (type === 'Deposit' && priority_op
                    ? +priority_op.amount
                    : +amount) / Math.pow(10, 18)
                )
                  .toFixed(3)
                  .toString(),
              )}
            </div>
            <div className='transaction-history-hash'>
              {token && token.toString().length > 10 ? (
                token
                  .toString()
                  .replace(
                    token.toString().slice(6, token.toString().length - 3),
                    '...',
                  )
              ) : (
                <>
                  {'zk'}
                  {type === 'Deposit' ? priority_op?.token : token}
                </>
              )}
            </div>
          </div>
          <input
            onChange={undefined}
            className='copy-block-input'
            value={hash.toString()}
            ref={e => inputRef.push(e)}
          />
          <div className='transaction-history-right'>
            <Transition trigger={isCopyModal} timeout={200} type='fly'>
              <div className={'hint-copied open'}>
                <p>Copied!</p>
              </div>
            </Transition>
            <div className='transaction-history-address'>
              {type === 'Transfer' && (
                <>
                  <span>Sent to:</span>
                  <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
                </>
              )}
              {type === 'Deposit' && (
                <>
                  <span>Deposited to:</span>
                  <p>Your account</p>
                </>
              )}
              {type === 'Withdraw' && (
                <>
                  <span>Withdrawed to:</span>
                  <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
                </>
              )}
            </div>
            <div className='contact-edit-wrapper'>
              <input type='radio' className='balances-contact-edit' />
              <div className='contact-manage'>
                <div>
                  <a target='_blank' href={`${ZK_EXPLORER}/${hash}`}>
                    View info on explorer
                  </a>
                </div>
                <div>
                  <button
                    className='contact-manage-copy btn-tr'
                    onClick={() => handleCopy()}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      emptyListComponent={() => (
        <div className='default-text'>{'History is empty'}</div>
      )}
      infScrollInitialCount={10}
    />
  );
};

export default Transactions;
