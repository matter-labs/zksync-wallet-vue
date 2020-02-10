import React, { useRef } from 'react';

import { IMyWallet } from './Types';

import { useRootData } from '../../hooks/useRootData';

import './Wallets.scss';

const MyWallet: React.FC<IMyWallet> = ({
  // balances,
  // price,
  title,
  // transactionAction,
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
      <div className="mywallet-currency-block"></div>
      <div className="mywallet-buttons-container">
        <button className="btn deposit-button">
          <span></span>Deposit
        </button>
        <button className="btn withdraw-button">
          <span></span>Withdraw
        </button>
      </div>
      <button className="btn submit-button" onClick={() => console.log('send')}>
        Send
      </button>
    </div>
  );
};

export default MyWallet;
