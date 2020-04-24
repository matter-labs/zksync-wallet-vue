import React, { FC, useState, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { Tx } from './Transactions';
import { Transition } from 'src/components/Transition/Transition';
import { useTimeout } from 'src/hooks/timers';
import { ZK_EXPLORER } from 'src/constants/links';
import { TxStatus } from 'src/components/Transaction/TxStatus';
import { FloatingMenu } from 'src/components/Common/FloatingMenu';

export const Transaction: FC<Tx> = props => {
  const {
    hash,
    tx: { amount, priority_op, type, to, token },
  } = props;

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleCopy = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el?.focus();
    el?.select();
    document.execCommand('copy');
    openCopyModal(true);
  }, [ref, openCopyModal]);

  useTimeout(() => isCopyModal && openCopyModal(false), 2000, [isCopyModal]);

  return (
    <div className='transaction-history-wrapper' key={hash}>
      <TxStatus tx={props} />
      <div className='transaction-history-left'>
        <div className={`transaction-history ${type}`}></div>
        <div className='transaction-history-amount'>
          {!!amount || !!priority_op?.amount
            ? parseFloat(
                (
                  (type === 'Deposit' && priority_op
                    ? +priority_op.amount
                    : +amount) / Math.pow(10, 18)
                )
                  .toFixed(6)
                  .toString(),
              )
            : 'Unlocking transaction'}
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
              {(priority_op?.token || token) && 'zk'}
              {type === 'Deposit' ? priority_op?.token : token}
            </>
          )}
        </div>
      </div>
      <input
        type='text'
        readOnly
        className='copy-block-input'
        value={hash.toString()}
        ref={ref}
      />
      <Transition trigger={isCopyModal} timeout={200} type='fly'>
        <div className={'hint-copied open'}>{'Copied!'}</div>
      </Transition>
      <div className='transaction-history-right'>
        <div className='transaction-history-address'>
          {type === 'Transfer' && (
            <>
              <span>{'Sent to:'}</span>
              <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
            </>
          )}
          {type === 'Deposit' && (
            <>
              <span>{'Deposited to:'}</span>
              <p>{'Your account'}</p>
            </>
          )}
          {type === 'Withdraw' && (
            <>
              <span>{'Withdrawed to:'}</span>
              <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
            </>
          )}
        </div>
      </div>
      <FloatingMenu>
        <a
          className='contact-manage-copy btn-tr'
          target='_blank'
          href={`${ZK_EXPLORER}/${hash}`}
        >
          <p>{'View info on explorer'}</p>
        </a>
        <button className='contact-manage-copy btn-tr' onClick={handleCopy}>
          <p>{'Copy'}</p>
        </button>
      </FloatingMenu>
    </div>
  );
};
