import React, { FC } from 'react';

export interface PieProps {
  value: number;
  total?: number;
  color?: string;
  status: string;
}

const percentCoords = percent =>
  [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)].join(' ');

const getPathD = percent =>
  `M ${percentCoords(0)} A 1 1 0 ${percent > 0.5 ? 1 : 0} 1 ${percentCoords(
    percent,
  )} L 0 0`;

export const TxStatus: FC<PieProps> = ({
  status,
  color = '#000',
  value,
  total,
}) => {
  const val = value / (total || 1);
  return (
    <div className='tx-status' title={status}>
      <svg width='100%' height='100%' viewBox='-1 -1 2 2'>
        {val >= 1 ? (
          <circle
            fill={color}
            stroke='#000'
            strokeWidth='0.05'
            cx='0'
            cy='0'
            r='1'
          />
        ) : (
          <path
            fill={color}
            stroke='#000'
            strokeWidth='0.05'
            d={getPathD(val > 1 ? 1 : val)}
          />
        )}
      </svg>
    </div>
  );
};
