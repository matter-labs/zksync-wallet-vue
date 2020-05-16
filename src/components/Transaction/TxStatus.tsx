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
  return `${confirmCount}/${maxConfirmAmount} confirmations`;
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
  <div className='tx-status' title={status}>
    <svg width='100%' height='100%' viewBox='-1 -1 2 2'>
      {children}
    </svg>
  </div>
);

const CheckMark = () => (
  <path
    stroke={PRIMARY_COLOR}
    strokeWidth='0.4'
    strokeLinecap='round'
    fill='transparent'
    style={{ transform: 'rotate(90deg)' }}
    d='M -0.7 0.2 L 0 0.8 L 0.9 -0.4'
  />
);

const Clock = () => (
  <g style={{ transform: 'rotate(90deg)' }}>
    <circle
      fill='transparent'
      cx='0'
      cy='0'
      r='0.8'
      stroke={PRIMARY_COLOR}
      strokeWidth='0.3'
    />
    <path
      d='M 0 0 L 0.3 -0.2 M 0 0 L 0 -0.4'
      stroke={PRIMARY_COLOR}
      strokeWidth='0.2'
      strokeLinecap='round'
    />
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
