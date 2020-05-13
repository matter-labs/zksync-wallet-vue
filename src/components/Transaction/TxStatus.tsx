import React, { FC } from 'react';
import { Tx } from 'src/pages/Transactions';

export interface PieProps {
  value: number;
  total?: number;
  color?: string;
  status: string;
}

const MAX_CONFIRM = 25;

export function getTxStatus(tx: Tx) {
  const { commited, verified, confirmCount } = tx;
  if (!commited && !verified) return 'Not commited & unverified';
  if (verified) return 'Verified';
  return `${confirmCount}/${MAX_CONFIRM} confirmations`;
}

export function getPieProps(tx: Tx) {
  const { commited, verified, confirmCount } = tx;
  if (commited && !verified)
    return { color: '#ff0', value: 1, status: 'Commited & unverified' };

  if (verified) return { color: '#0f0', value: 1, status: 'Verified' };

  return {
    value: confirmCount / MAX_CONFIRM,
    status: `${confirmCount}/${MAX_CONFIRM} confirmations`,
  };
}

const percentCoords = percent =>
  [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)].join(' ');

const getPieChartD = percent =>
  `M ${percentCoords(0)} A 1 1 0 ${percent > 0.5 ? 1 : 0} 1 ${percentCoords(
    percent,
  )} L 0 0`;

const Wrapper = ({ children, status }) => (
  <div className='tx-status' title={status}>
    <svg width='100%' height='100%' viewBox='-1 -1 2 2'>
      {children}
    </svg>
  </div>
);

export const TxStatus: FC<{ tx: Tx }> = ({ tx }) => {
  const status = getTxStatus(tx);
  if (status.endsWith('confirmations')) {
    console.log({ hash: tx.hash, confirmations: tx.confirmCount });
  }
  const val = tx.confirmCount / (MAX_CONFIRM || 1);

  // Chechbox
  if (tx.verified || tx.tx.type !== 'Deposit') {
    return (
      <Wrapper status={status}>
        <path
          stroke='#8C8DFC'
          strokeWidth='0.4'
          strokeLinecap='round'
          fill='transparent'
          style={{ transform: 'rotate(90deg)' }}
          d='M -0.7 0.2 L 0 0.8 L 0.9 -0.4'
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper status={status}>
      {val >= 1 ? (
        <circle fill='#8c8dfc' cx='0' cy='0' r='1' />
      ) : (
        <path fill='#8c8dfc' d={getPieChartD(val)} />
      )}
    </Wrapper>
  );
};
