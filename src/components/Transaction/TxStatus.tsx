import React, { FC, useState } from 'react';
import { getDefaultProvider } from 'ethers';

import { Tx } from 'src/pages/Transactions';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';
import SpinnerWorm from '../Spinner/SpinnerWorm';
import { MAX_WITHDRAWAL_TIME } from 'src/config';
import { getConfirmationCount, handleGetUTCHours } from 'src/utils';
import { LINKS_CONFIG } from 'src/config';
import { ALL_APPLE_DEVICES } from 'src/constants/regExs';

export interface PieProps {
  value: number;
  total?: number;
  color?: string;
  status: string;
}

export function getTxStatus(tx: Tx, confirmCmount: number, store) {
  const { commited, verified, confirmCount } = tx;
  if (tx.tx.type === 'Deposit' && !commited && !verified)
    return `(${
      confirmCmount > store.maxConfirmAmount
        ? store.maxConfirmAmount
        : confirmCmount
    }/${store.maxConfirmAmount} confirmations)`;
  if (verified) return 'Verified';
  return 'Pending';
}

const percentCoords = percent =>
  [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)].join(' ');

const getPieChartD = percent =>
  `M ${percentCoords(0)} A 1 1 0 ${percent > 0.5 ? 1 : 0} 1 ${percentCoords(
    percent,
  )} L 0 0`;

const PRIMARY_COLOR = '#8C8DFC';
const LOADING_COLOR = 'rgba(0, 0, 0, 0.4)';

const DoubleCheckMark = () => (
  <svg width='35' height='35' viewBox='26 6 26 8'>
    <path
      fill='#58AE67'
      xmlns='http://www.w3.org/2000/svg'
      d='M27.923 10.33l5.42 5.47L43.656 5.56l-1.998-1.998-8.065 7.9-3.33-3.355zm8.587 2.908l2.538 2.493L49.36 5.492l-1.998-1.998-8.065 7.9-.447-.378z'
    />
  </svg>
);

const CheckMark = () => (
  <svg width='35' height='35' viewBox='26 6 26 8'>
    <g style={{ transform: 'translate(100%)' }}>
      <path
        fill='#aa935d'
        xmlns='http://www.w3.org/2000/svg'
        d='M4.6 10.642l5.42 5.47 10.314-10.24-1.998-1.998-8.065 7.9L6.93 8.43z'
      />
    </g>
  </svg>
);

export const TxStatus: FC<{ tx: Tx }> = observer(({ tx }) => {
  const [confirmation, setConfirmation] = useState<number>(0);
  const store = useStore();
  const isZkSync = tx.hash.startsWith('sync-tx');
  const provider = getDefaultProvider(LINKS_CONFIG.network);
  !isZkSync
    ? getConfirmationCount(provider, tx.hash).then(res => {
        setConfirmation(res);
        return res;
      })
    : 0;
  let status = getTxStatus(tx, confirmation, store);
  const val = tx.confirmCount / (store.maxConfirmAmount || 1);

  let content: JSX.Element | null = null;
  const d = new Date();
  const handleTimeLeft = () => {
    const currentTimeInSeconds = parseInt(
      (handleGetUTCHours(d).getTime() / 1000).toString(),
    );
    const createdAtInSeconds = parseInt(
      (
        (navigator.userAgent.match(ALL_APPLE_DEVICES)
          ? handleGetUTCHours(new Date(tx.created_at)).getTime()
          : new Date(tx.created_at).getTime()) / 1000
      ).toString(),
    );
    const timeLeft =
      MAX_WITHDRAWAL_TIME - (currentTimeInSeconds - createdAtInSeconds);
    const timeLeftInMunutes = {
      minutes: Math.floor(timeLeft / 60),
      seconds: timeLeft - 60 * Math.floor(timeLeft / 60),
      timeLeft: timeLeft,
      hours: Math.floor(timeLeft / 3600),
    };
    return timeLeftInMunutes;
  };
  const handleCheckForHours =
    handleTimeLeft().hours > 0 ? `${handleTimeLeft().hours} hours ` : '';
  const minutesRelativelyToHours =
    handleTimeLeft().hours > 0
      ? handleTimeLeft().minutes - handleTimeLeft().hours * 60
      : handleTimeLeft().minutes;

  if (tx.verified) {
    status = 'Verified';
    content = <DoubleCheckMark />;
  } else if (tx.commited && tx.tx.type === 'Withdraw') {
    // status = 'Withdrawal in progress — it should take max. 60 min';
    // status =
    //   handleTimeLeft().minutes < 0
    //     ? 'Operation is taking a bit longer than usual, it should be right there!'
    //     : `Max ${
    //         isNaN(handleTimeLeft().timeLeft)
    //           ? MAX_WITHDRAWAL_TIME
    //           : `${handleCheckForHours}${minutesRelativelyToHours} min ${
    //               handleTimeLeft().seconds
    //             } sec`
    //       }s left`;
    // content = <SpinnerWorm />;
    status = 'Commited';
    content = <CheckMark />;
  } else if (tx.commited) {
    status = 'Commited';
    content = <CheckMark />;
  } else {
    if (tx.tx.type === 'Deposit') {
      status = status;
    } else {
      if (!tx.commited && tx.tx.type === 'Withdraw') {
        // status = 'Withdrawal in progress — it should take max. 60 min';
        status =
          handleTimeLeft().minutes < 0
            ? 'Operation is taking a bit longer than usual, it should be right there!'
            : `Max ${
                isNaN(handleTimeLeft().timeLeft)
                  ? MAX_WITHDRAWAL_TIME
                  : `${handleCheckForHours}${minutesRelativelyToHours} min ${
                      handleTimeLeft().seconds
                    } sec`
              }s left`;
      } else {
        status = 'Transaction in progress';
      }
    }
    content = <SpinnerWorm />;
  }

  return (
    <div className='tx-status' style={{ width: 35, height: 35 }}>
      <span className='tooltip'>{status}</span>
      {content}
    </div>
  );
});
