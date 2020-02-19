import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';
import { useTransaction } from '../../hooks/useTransaction';

import { IMyWalletProps } from './Types';

import './Wallets.scss';

const MyWallet: React.FC<IMyWalletProps> = ({ price }): JSX.Element => {
  const { transactionModal, setTransactionModal, zkBalances, zkWallet } = useRootData(
    ({ transactionModal, setTransactionModal, zkBalances, zkWallet }) => ({
      transactionModal: transactionModal.get(),
      setTransactionModal,
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
  const [selectedBalance, setSelectedBalance] = useState<any>(!!zkBalances?.length ? zkBalances[0] : 0);
  const [symbolName, setSymbolName] = useState<any>(!!zkBalances?.length ? zkBalances[0].symbol : '');
  const [walletBalance, setWalletBalance] = useState<string>(zkBalances[0]?.balance.toString());

  const { deposit, transfer, withdraw } = useTransaction();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
    document.execCommand('copy');
  }, []);

  const handleSelect = useCallback(name => {
    setSelectedBalance(name);
  }, []);

  const handleClickOutside = useCallback(e => {
    if (e.target.getAttribute('data-name')) {
      e.stopPropagation();
      openBalancesList(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [handleClickOutside]);

  return (
    <>
      <>
        <div className={`mywallet-wrapper ${!!transactionModal?.title ? 'closed' : 'open'}`}>
          <h2 className="mywallet-title">My wallet</h2>
          <div className="copy-block">
            <input className="copy-block-input" value={zkWallet?.address()} ref={inputRef} />
            <div>
              {zkWallet?.address().replace(zkWallet?.address().slice(6, zkWallet?.address().length - 3), '...')}
            </div>
            <button className="copy-block-button" onClick={handleCopy}></button>
          </div>
          <div className="mywallet-currency-block">
            <div className="mywallet-currency-wrapper">
              <span className="mywallet-currency-balance">
                {walletBalance ? walletBalance : zkBalances[0]?.balance.toString()}
              </span>
              {/* <select className="mywallet-currency-selector" onChange={e => setWalletBalance(e.target.value)}>
                {zkBalances?.length &&
                  zkBalances.map(({ address, balance, symbol }) => (
                    <option key={address} value={balance}>
                      zk{symbol}
                    </option>
                  ))}
              </select> */}
              <div className="custom-selector balances mywallet">
                <div onClick={() => openBalancesList(!isBalancesListOpen)} className="custom-selector-title">
                  {symbolName ? (
                    <p>zk{symbolName}</p>
                  ) : (
                    <span>
                      zk
                      {selectedBalance.symbol
                        ? selectedBalance.symbol
                        : !!zkBalances?.length
                        ? zkBalances[0].symbol
                        : 'empty'}
                    </span>
                  )}
                  <div></div>
                </div>
                <ul className={`custom-selector-list ${isBalancesListOpen ? 'open' : 'closed'}`}>
                  {zkBalances?.length &&
                    zkBalances.map(({ address, balance, symbol }) => (
                      <li
                        className="custom-selector-list-item"
                        key={address}
                        value={balance}
                        onClick={() => {
                          setWalletBalance(balance.toString());
                          handleSelect(symbol);
                          openBalancesList(false);
                          setSymbolName(symbol);
                        }}
                      >
                        zk{symbol}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <span className="mywallet-price">
              ~
              {(
                price *
                zkBalances?.reduce((acc, cur) => {
                  return acc + cur.balance;
                }, 0)
              ).toFixed(2)}{' '}
              USD
            </span>
          </div>
          <div className="mywallet-buttons-container">
            <button
              onClick={() => setTransactionModal({ title: 'Deposit', input: false, action: deposit })}
              className="btn deposit-button"
            >
              <span></span>Deposit
            </button>
            <button
              onClick={() => setTransactionModal({ title: 'Withdraw', input: true, action: withdraw, type: 'eth' })}
              className="btn withdraw-button"
            >
              <span></span>Withdraw
            </button>
          </div>
          <button
            className="btn submit-button"
            onClick={() => setTransactionModal({ title: 'Send', input: true, action: transfer, type: 'sync' })}
          >
            <span></span> Send
          </button>
        </div>
      </>

      {/* <div
        data-name="modal-wrapper"
        className={`modal-wrapper ${isBalancesListOpen ? 'open' : 'closed'}`}
      ></div> */}
    </>
  );
};

export default MyWallet;
