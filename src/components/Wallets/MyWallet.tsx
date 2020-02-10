import React, { useRef } from 'react';

import { IMyWallet } from './Types';

import { useRootData } from '../../hooks/useRootData';
import { useTransaction } from '../../hooks/useTransaction';

import './Wallets.scss';

const MyWallet: React.FC<IMyWallet> = ({ price }): JSX.Element => {
  const { transactionModal, setTransactionModal, zkBalances, zkWallet } = useRootData(
    ({ transactionModal, setTransactionModal, zkBalances, zkWallet }) => ({
      transactionModal: transactionModal.get(),
      setTransactionModal,
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const { deposit, withdraw } = useTransaction();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    inputRef.current!.select();
    document.execCommand('copy');
  };

  const zkBalancesSum = () => {
    let sum = 0;
    for (const el in zkBalances) {
      sum += zkBalances[el].balance;
    }
    return sum;
  };

  return (
    <div className={`mywallet-wrapper ${transactionModal?.title.length ? 'closed' : 'open'}`}>
      <h2 className="mywallet-title">My wallet</h2>
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
      <div className="mywallet-currency-block">
        <select className="currency-selector">
          {zkBalances?.length &&
            zkBalances.map(({ address, balance, symbol }) => (
              <option key={address} value={balance}>
                {balance}
                zk{symbol}
              </option>
            ))}
        </select>
        <span className="mywallet-price">~{(price * zkBalancesSum()).toFixed(2)} USD</span>
      </div>
      <div className="mywallet-buttons-container">
        <button
          onClick={() => setTransactionModal({ title: 'Deposit', input: false, action: deposit })}
          className="btn deposit-button"
        >
          <span></span>Deposit
        </button>
        <button
          onClick={() => setTransactionModal({ title: 'Withdraw', input: true, action: withdraw })}
          className="btn withdraw-button"
        >
          <span></span>Withdraw
        </button>
      </div>
      <button
        className="btn submit-button"
        onClick={() => setTransactionModal({ title: 'Send', input: true, action: withdraw })}
      >
        Send
      </button>
    </div>
  );
};

export default MyWallet;
