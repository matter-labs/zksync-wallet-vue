import React, { useRef, useState } from 'react';

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

  const [walletBalance, setWalletBalance] = useState<string>(zkBalances[0]?.balance.toString());

  const { deposit, transfer, withdraw } = useTransaction();

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
        <div className="mywallet-currency-wrapper">
          <span className="mywallet-currency-balance">
            {walletBalance ? walletBalance : zkBalances[0]?.balance.toString()}
          </span>
          <select className="mywallet-currency-selector" onChange={e => setWalletBalance(e.target.value)}>
            {zkBalances?.length &&
              zkBalances.map(({ address, balance, symbol }) => (
                <option key={address} value={balance}>
                  zk{symbol}
                </option>
              ))}
          </select>
        </div>

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
        onClick={() => setTransactionModal({ title: 'Send', input: true, action: transfer })}
      >
        <span></span> Send
      </button>
    </div>
  );
};

export default MyWallet;
