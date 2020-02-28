import React, { useCallback, useEffect, useState } from 'react';

import avatar from '../../images/avatar.png';
import DataList from '../DataList/DataList';
import Spinner from '../Spinner/Spinner';

import { useRootData } from '../../hooks/useRootData';

import { IMyWalletProps } from './Types';

import './Wallets.scss';

const MyWallet: React.FC<IMyWalletProps> = ({ price, setTransactionType }): JSX.Element => {
  const {
    searchBalances,
    setBalances,
    setModal,
    transactionModal,
    zkBalances,
    zkBalancesLoaded,
    zkWallet,
  } = useRootData(
    ({ searchBalances, setBalances, setModal, transactionModal, zkBalances, zkBalancesLoaded, zkWallet }) => ({
      searchBalances: searchBalances.get(),
      setBalances,
      setModal,
      transactionModal: transactionModal.get(),
      zkBalances: zkBalances.get(),
      zkBalancesLoaded: zkBalancesLoaded.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const dataPropertyName = 'symbol';

  const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
  const [isAssetsOpen, openAssets] = useState<boolean>(false);
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
      openAssets(false);
    }
  }, []);

  useEffect(() => {
    setBalances(zkBalances);
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [handleClickOutside, zkBalances]);

  console.log(zkBalancesLoaded);

  return (
    <>
      <div className={`assets-wrapper ${isAssetsOpen ? 'open' : 'closed'}`}>
        <DataList
          setValue={setBalances}
          dataProperty={dataPropertyName}
          data={zkBalances}
          title="Select asset"
          visible={true}
        >
          <button
            onClick={() => {
              openAssets(false);
            }}
            className="close-icon"
          ></button>
          {!!searchBalances.length ? (
            searchBalances.map(({ symbol, balance }) => (
              <div
                onClick={() => {
                  setWalletBalance(balance.toString());
                  handleSelect(symbol);
                  openBalancesList(false);
                  setSymbolName(symbol);
                  openAssets(false);
                }}
                key={balance}
                className="balances-token"
              >
                <div className="balances-token-left">
                  <div className={`logo ${symbol}`}></div>
                  <div className="balances-token-name">
                    <p>{symbol}</p>
                    <span>
                      {symbol === 'ETH' && <>Ethereum</>}
                      {symbol === 'DAI' && <>Dai</>}
                      {symbol === 'FAU' && <>Faucet</>}
                    </span>
                  </div>
                </div>
                <div className="balances-token-right">
                  <span>balance: {balance}</span>
                </div>
              </div>
            ))
          ) : (
            <div></div>
          )}
        </DataList>
      </div>
      <div data-name="assets-wrapper" className={`assets-wrapper-bg ${isAssetsOpen ? 'open' : 'closed'}`}></div>
      <>
        <div className={`mywallet-wrapper ${!!transactionModal?.title ? 'closed' : 'open'}`}>
          <h2 className="mywallet-title">My wallet</h2>
          <div onClick={() => handleCopy(zkWallet?.address())} className="copy-block">
            <input className="copy-block-input" readOnly value={zkWallet?.address()} ref={e => inputRef.push(e)} />
            <div className="copy-block-left">
              <img src={avatar} alt="avatar" />{' '}
              <div>
                {zkWallet?.address().replace(zkWallet?.address().slice(14, zkWallet?.address().length - 4), '...')}
              </div>
            </div>
            <button className="copy-block-button" onClick={() => handleCopy(zkWallet?.address())}></button>
          </div>
          <div className={`mywallet-currency-block ${isBalancesListOpen ? 'borderless' : ''}`}>
            <div
              data-name="custom-selector"
              className={`mywallet-currency-block-shadow ${isBalancesListOpen ? 'open' : 'closed'}`}
            ></div>
            <div className="mywallet-currency-wrapper">
              <span className="mywallet-currency-balance">
                {walletBalance ? walletBalance : zkBalances[0]?.balance.toString()}
              </span>
              <div className="custom-selector balances mywallet">
                <div onClick={() => openAssets(true)} className="custom-selector-title">
                  {symbolName ? (
                    <p>zk{symbolName}</p>
                  ) : (
                    <p>
                      {!!zkBalances.length &&
                        (selectedBalance.symbol ? (
                          <span>zk{selectedBalance.symbol}</span>
                        ) : (
                          <span>zk{zkBalances[0].symbol}</span>
                        ))}
                      {!zkBalances.length && (!zkBalancesLoaded ? <Spinner /> : <span>empty</span>)}
                    </p>
                  )}
                  <div className="arrow-down"></div>
                </div>
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
      <div
        data-name="custom-selector"
        className={`custom-selector-wrapper ${isBalancesListOpen ? 'open' : 'closed'}`}
      ></div>
    </>
  );
};

export default MyWallet;
