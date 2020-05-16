import React, { FC } from 'react';
import { Tx } from 'src/pages/Transactions';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

export interface PieProps {
  value: number;
  total?: number;
  color?: string;
  status: string;
}

export function getTxStatus(tx: Tx, maxConfirmAmount: number) {
  const { commited, verified, confirmCount } = tx;
  if (!commited && !verified) return 'Not commited & unverified';
  if (verified) return 'Verified';
  if (tx.tx.type === 'Deposit')
    return `${confirmCount}/${maxConfirmAmount} confirmations`;
  return 'Committed & unverified';
}

const percentCoords = percent =>
  [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)].join(' ');

const getPieChartD = percent =>
  `M ${percentCoords(0)} A 1 1 0 ${percent > 0.5 ? 1 : 0} 1 ${percentCoords(
    percent,
  )} L 0 0`;

const PRIMARY_COLOR = '#8C8DFC';
const LOADING_COLOR = 'rgba(0, 0, 0, 0.4)';

const Wrapper = ({ children, status }) => (
  <div className='tx-status'>
    <span className='tooltip'>{status}</span>
    <svg width='35' height='35' viewBox='26 6 26 8'>
      {children}
    </svg>
  </div>
);

const CheckMark = () => (
  <path
    fill='#58AE67'
    xmlns='http://www.w3.org/2000/svg'
    d='M27.923 10.33l5.42 5.47L43.656 5.56l-1.998-1.998-8.065 7.9-3.33-3.355zm8.587 2.908l2.538 2.493L49.36 5.492l-1.998-1.998-8.065 7.9-.447-.378z'
  ></path>
);

const Clock = () => (
  <g style={{ transform: 'translate(100%)' }}>
    <path
      fill='#aa935d'
      transform='translateX(100px)'
      xmlns='http://www.w3.org/2000/svg'
      d='M4.6 10.642l5.42 5.47 10.314-10.24-1.998-1.998-8.065 7.9L6.93 8.43z'
    ></path>
  </g>
);

export const TxStatus: FC<{ tx: Tx }> = observer(({ tx }) => {
  const store = useStore();
  const isZkSync = tx.hash.startsWith('sync-tx');
  const status = getTxStatus(tx, store.maxConfirmAmount);
  const val = tx.confirmCount / (store.maxConfirmAmount || 1);

  let content: JSX.Element | null = null;

  if (!tx.verified) {
    if (isZkSync || val > 1) {
      content = <Clock />;
    } else {
      content =
        val >= 1 ? (
          <circle fill={LOADING_COLOR} cx='0' cy='0' r='1' />
        ) : (
          <path fill={LOADING_COLOR} d={getPieChartD(val)} />
        );
    }
  } else {
    content = <CheckMark />;
  }

  return <Wrapper status={status}>{content}</Wrapper>;
});
