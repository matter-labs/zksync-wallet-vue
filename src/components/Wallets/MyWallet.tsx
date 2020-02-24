import React, { useCallback, useEffect, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { IMyWalletProps } from './Types';

import './Wallets.scss';
import Spinner from '../Spinner/Spinner';

const MyWallet: React.FC<IMyWalletProps> = ({ price, setTransactionType }): JSX.Element => {
  const { transactionModal, zkBalances, zkWallet } = useRootData(({ transactionModal, zkBalances, zkWallet }) => ({
    transactionModal: transactionModal.get(),
    zkBalances: zkBalances.get(),
    zkWallet: zkWallet.get(),
  }));

  const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
  const [selectedBalance, setSelectedBalance] = useState<any>(!!zkBalances?.length ? zkBalances[0] : 0);
  const [symbolName, setSymbolName] = useState<any>(!!zkBalances?.length ? zkBalances[0].symbol : '');
  const [walletBalance, setWalletBalance] = useState<string>(zkBalances[0]?.balance.toString());

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    address => {
      inputRef.map(el => {
        if (address === el?.value) {
          el?.focus();
          el?.select();
          document.execCommand('copy');
        }
      });
    },
    [inputRef],
  );

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
            <input
              className="copy-block-input"
              onChange={undefined}
              value={zkWallet?.address()}
              ref={e => inputRef.push(e)}
            />
            <div>
              {zkWallet?.address().replace(zkWallet?.address().slice(6, zkWallet?.address().length - 3), '...')}
            </div>
            <button className="copy-block-button" onClick={() => handleCopy(zkWallet?.address())}></button>
          </div>
          <div className="mywallet-currency-block">
            <div className="mywallet-currency-wrapper">
              <span className="mywallet-currency-balance">
                {walletBalance ? walletBalance : zkBalances[0]?.balance.toString()}
              </span>
              <div className="custom-selector balances mywallet">
                <div onClick={() => openBalancesList(!isBalancesListOpen)} className="custom-selector-title">
                  {symbolName ? (
                    <p>zk{symbolName}</p>
                  ) : (
                    <span>
                      {selectedBalance.symbol ? (
                        <>zk{selectedBalance.symbol}</>
                      ) : !!zkBalances?.length ? (
                        <>zk{zkBalances[0].symbol}</>
                      ) : (
                        <Spinner />
                      )}
                    </span>
                  )}
                  <div className="arrow-down"></div>
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
            <button onClick={() => setTransactionType('deposit')} className="btn deposit-button">
              <span></span>Deposit
            </button>
            <button onClick={() => setTransactionType('withdraw')} className="btn withdraw-button">
              <span></span>Withdraw
            </button>
          </div>
          <button className="btn submit-button" onClick={() => setTransactionType('transfer')}>
            <span></span> Send
          </button>
        </div>
      </>
      <div data-name="modal-wrapper" className={`modal-wrapper ${isBalancesListOpen ? 'open' : 'closed'}`}></div>
    </>
  );
};

export default MyWallet;
