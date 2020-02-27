import React, { useCallback, useEffect, useState } from 'react';

import Modal from '../Modal/Modal';
import SaveContacts from '../SaveContacts/SaveContacts';
import Spinner from '../Spinner/Spinner';

import { ITransactionProps } from './Types';

import { INPUT_VALIDATION } from '../../constants/regExs';

import { useRootData } from '../../hooks/useRootData';

import clocks from '../../images/mdi_access_time.svg';

import './Transaction.scss';

const Transaction: React.FC<ITransactionProps> = ({
  addressValue,
  balances,
  hash,
  isExecuted,
  isInput,
  isLoading,
  onChangeAddress,
  onChangeAmount,
  price,
  setHash,
  setExecuted,
  setTransactionType,
  title,
  transactionAction,
  type,
}): JSX.Element => {
  const { ethId, setModal, setWalletAddress, walletAddress } = useRootData(
    ({ ethId, setModal, setWalletAddress, walletAddress }) => ({
      ethId: ethId.get(),
      setModal,
      setWalletAddress,
      walletAddress: walletAddress.get(),
    }),
  );

  const baseBalance = !!balances?.length ? balances[0] : 0;

  const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
  const [isContactsListOpen, openContactsList] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number>();
  const [maxValue, setMaxValue] = useState<number>(!!balances?.length ? balances[0].balance : 0);
  const [selectedBalance, setSelectedBalance] = useState<any>(baseBalance);
  const [selectedContact, setSelectedContact] = useState<any>();
  const [symbolName, setSymbolName] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [unlockFau, setUnlockFau] = useState<boolean>(false);
  const [value, setValue] = useState<string>(localStorage.getItem('walletName') || '');

  const validateNumbers = e => {
    if (INPUT_VALIDATION.digits.test(e)) {
      e <= maxValue ? setInputValue(+e) : setInputValue(+maxValue);
    }
  };

  const arr: any = localStorage.getItem('contacts');
  const contacts = JSON.parse(arr);

  const handleCancel = useCallback(() => {
    setHash('');
    setExecuted(false);
    setTransactionType(undefined);
  }, [setExecuted, setTransactionType, setHash]);

  const setWalletName = useCallback(() => {
    if (value && value !== ethId) {
      localStorage.setItem('walletName', value);
    } else {
      setValue(localStorage.getItem('walletName') || ethId);
    }
  }, [ethId, value]);

  const handleSelect = useCallback(
    name => {
      if (isContactsListOpen) {
        setSelectedContact(name);
      }
      if (isBalancesListOpen) {
        setSelectedBalance(name);
      }
    },
    [isBalancesListOpen, isContactsListOpen],
  );

  const handleClickOutside = useCallback(e => {
    if (e.target.getAttribute('data-name')) {
      e.stopPropagation();
      openContactsList(false);
      openBalancesList(false);
    }
  }, []);

  useEffect(() => {
    if (balances?.length) {
      setToken(balances[0].address ? balances[0].address : balances[0].symbol);
    }
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [handleClickOutside]);

  return (
    <>
      <div
        data-name="modal-wrapper"
        className={`modal-wrapper ${isContactsListOpen || isBalancesListOpen ? 'open' : 'closed'}`}
      ></div>
      <Modal visible={false} classSpecifier="add-contact" background={true}>
        <SaveContacts title="Add contact" addressValue={addressValue} addressInput={false} />
      </Modal>
      <div className="transaction-wrapper">
        {isExecuted ? (
          <>
            <button
              onClick={() => {
                handleCancel();
                setWalletAddress('');
                setTransactionType(undefined);
              }}
              className="transaction-back"
            ></button>
            <h2 className="transaction-title">{title} successful!</h2>
            <span className="transaction-field-title">{title} into zk Sync:</span>
            <p className="transaction-field-amount">{inputValue}</p>
            <div className="info-block">
              <p>
                Waiting for the block to be mined... <br /> Wasn’t that easy?
              </p>{' '}
              <img src={clocks} alt="clocks" />
            </div>
            <p className="transaction-hash">
              Tx hash:<span>{typeof hash === 'string' ? hash : hash?.hash}</span>
            </p>
            <button
              className="btn submit-button"
              onClick={() => {
                handleCancel();
                setWalletAddress('');
                setTransactionType(undefined);
              }}
            >
              Go to my wallet
            </button>
          </>
        ) : (
          <>
            {isLoading ? (
              <>
                <Spinner />
                <button
                  className="btn submit-button"
                  onClick={() => {
                    handleCancel();
                    setWalletName();
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleCancel();
                    setWalletAddress('');
                    setTransactionType(undefined);
                  }}
                  className="transaction-back"
                ></button>
                <h2 className="transaction-title">{title}</h2>
                {isInput && (
                  <>
                    <span className="transaction-field-title">To address</span>
                    <div className="transaction-field">
                      <div className="currency-input-wrapper">
                        <input
                          placeholder="Ox address, ENS or contact name"
                          value={walletAddress ? (addressValue = walletAddress) : addressValue}
                          onChange={onChangeAddress}
                          className="currency-input-address"
                        />
                        {(walletAddress || addressValue) && !walletAddress && (
                          <button className="add-contact-button-input" onClick={() => setModal('add-contact')}>
                            <span></span>
                            <p>Save</p>
                          </button>
                        )}
                        <div className="custom-selector contacts">
                          <div onClick={() => openContactsList(!isContactsListOpen)} className="custom-selector-title">
                            {selectedContact ? <p>{selectedContact}</p> : <span></span>}
                            <div className="arrow-down"></div>
                          </div>
                          <ul className={`custom-selector-list ${isContactsListOpen ? 'open' : 'closed'}`}>
                            {contacts?.length &&
                              contacts.map(({ name, address }) => (
                                <li
                                  className="custom-selector-list-item"
                                  key={address}
                                  onClick={() => {
                                    handleSelect(name);
                                    setWalletAddress(address);
                                    openContactsList(false);
                                  }}
                                >
                                  {name}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <span className="transaction-field-title">Amount / asset</span>
                <div className="transaction-field balance">
                  <div className="currency-input-wrapper border">
                    <input
                      placeholder="0.00"
                      className="currency-input"
                      type="number"
                      step={0.001}
                      onChange={e => {
                        validateNumbers(+e.target.value);
                        onChangeAmount(+e.target.value);
                      }}
                      value={inputValue}
                    />
                    <button className="all-balance" onClick={() => setInputValue(maxValue)}>
                      <span>+</span> All balance
                    </button>
                    <div className="custom-selector balances">
                      <div onClick={() => openBalancesList(!isBalancesListOpen)} className="custom-selector-title">
                        {symbolName ? (
                          <p>{symbolName}</p>
                        ) : (
                          <span>{selectedBalance.symbol ? selectedBalance.symbol : <Spinner />}</span>
                        )}
                        <div className="arrow-down"></div>
                      </div>
                      <ul className={`custom-selector-list ${isBalancesListOpen ? 'open' : 'closed'}`}>
                        {balances?.length &&
                          balances.map(({ address, balance, symbol }) => (
                            <li
                              className="custom-selector-list-item"
                              key={address}
                              value={balance}
                              onClick={() => {
                                setToken(+address ? address : symbol);
                                setMaxValue(balance);
                                setSymbolName(symbol);
                                handleSelect(symbol);
                                openBalancesList(false);
                              }}
                            >
                              {symbol}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  {balances?.length && (
                    <div className="currency-input-wrapper" key={token}>
                      <span>~${(price * (maxValue ? maxValue : balances[0].balance)).toFixed(2)}</span>
                      <span>
                        Balance: {maxValue ? maxValue : balances[0].balance}{' '}
                        {symbolName ? symbolName : balances[0].symbol}
                      </span>
                    </div>
                  )}
                </div>
                <div onClick={() => setUnlockFau(true)} className="fau-unlock-wrapper">
                  <p>{selectedBalance.symbol} tocken unlocked</p>
                  <button className={`fau-unlock-tocken ${unlockFau}`}>
                    <span className={`fau-unlock-tocken-circle ${unlockFau}`}></span>
                  </button>
                </div>
                <button
                  className={`btn submit-button ${unlockFau ? '' : 'disabled'}`}
                  onClick={() => transactionAction(token, type)}
                >
                  {title}
                </button>
                <p key={maxValue} className="transaction-fee">
                  Fee:{' '}
                  {balances?.length && (
                    <span>
                      {maxValue ? maxValue * 0.001 : balances[0].balance * 0.001}{' '}
                      {symbolName ? symbolName : balances[0].symbol}
                    </span>
                  )}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Transaction;
