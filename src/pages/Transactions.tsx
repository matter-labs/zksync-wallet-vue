import React, { useCallback, useState } from 'react';

import { DataList } from 'components/DataList/DataListNew';
import { ZK_EXPLORER } from 'constants/links';
import { useRootData } from 'hooks/useRootData';
import { useTimeout } from 'hooks/timers';
import { Transition } from 'components/Transition/Transition';
import { useCheckLogin } from 'hooks/useCheckLogin';

const Transactions: React.FC = (): JSX.Element => {
  const { zkWallet } = useRootData(
    ({ ethId, provider, searchTransactions, zkWallet }) => ({
      ethId: ethId.get(),
      provider: provider.get(),
      searchTransactions: searchTransactions.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const [isCopyModal, openCopyModal] = useState<boolean>(false);

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    address => {
      inputRef.map(el => {
        if (address === el?.value) {
          el?.focus();
          el?.select();
          document.execCommand('copy');
        }
      });
      openCopyModal(true);
    },
    [inputRef],
  );

  useTimeout(() => isCopyModal && openCopyModal(false), 2000);

  useCheckLogin();

  return (
    <DataList
      // TODO: fetch transactions list (waiting for CORS on backend side)
      // setValue={setTransactions}
      // dataProperty={dataPropertyName}
      // data={transactions}
      data={[] as any[]}
      title='Transactions'
      visible={true}
      renderItem={({ amount, type, hash, to, token }) => (
        <div className='transaction-history-wrapper' key={hash}>
          <div className='transaction-history-left'>
            <div className={`transaction-history ${type}`}></div>
            <div className='transaction-history-amount'>
              {+amount.toFixed(3)}
            </div>
            <div className='transaction-history-hash'>
              {token && token.length > 10 ? (
                token.replace(token.slice(6, token.length - 3), '...')
              ) : (
                <>
                  {'zk'}
                  {token}
                </>
              )}
            </div>
          </div>
          <input
            onChange={undefined}
            className='copy-block-input'
            value={to.toString()}
            ref={e => inputRef.push(e)}
          />
          <div className='transaction-history-right'>
            <Transition trigger={isCopyModal} timeout={200} type='fly'>
              <div className={'hint-copied open'}>
                <p>Copied!</p>
              </div>
            </Transition>
            <div className='transaction-history-address'>
              {type === 'transfer' && (
                <>
                  <span>Sent to:</span>
                  <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
                </>
              )}
              {type === 'deposit' && (
                <>
                  <span>Deposited to:</span>
                  <p>Your account</p>
                </>
              )}
              {type === 'withdraw' && (
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
                    onClick={() => handleCopy(to)}
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
