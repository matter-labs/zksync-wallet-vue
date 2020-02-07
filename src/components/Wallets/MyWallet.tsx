import React, { useRef } from 'react';

import { IMyWallet } from './Types';

import { useRootData } from '../../hooks/useRootData';

import './Wallets.scss';

const MyWallet: React.FC<IMyWallet> = ({
  // balances,
  // price,
  title,
  // zkBalances,
}): JSX.Element => {
  const { zkWallet } = useRootData(({ zkWallet }) => ({
    zkWallet: zkWallet.get(),
  }));

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    inputRef.current!.select();
    document.execCommand('copy');
  };

  return (
    <div className="mywallet-wrapper">
      <h2 className="mywallet-title">{title}</h2>
      <div className="copy-block">
        <input
          onChange={() => console.log(null)}
          className="copy-block-input"
          value={zkWallet?.address()}
          ref={inputRef}
        />
        <div>{zkWallet?.address().replace(zkWallet?.address().slice(6, zkWallet?.address().length - 3), '...')}</div>
        <button className="copy-block-button" onClick={handleCopy}></button>
      </div>
    </div>
  );
};

export default MyWallet;
