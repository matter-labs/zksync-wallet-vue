import React, { useCallback, useState } from 'react';

import Modal from '../Modal/Modal';
import SaveContacts from '../SaveContacts/SaveContacts';

import { ITransactionProps } from './Types';

import { INPUT_VALIDATION } from '../../constants/regExs';

import { useRootData } from '../../hooks/useRootData';
import { useTransaction } from '../../hooks/useTransaction';

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
  title,
  transactionAction,
  zkBalances,
}): JSX.Element => {
  const { ethId, setModal, setTransactionModal } = useRootData(({ ethId, setModal, setTransactionModal }) => ({
    ethId: ethId.get(),
    setModal,
    setTransactionModal,
  }));

  const { setExecuted, setHash } = useTransaction();

  const [token, setToken] = useState<string>('');
  const [inputValue, setInputValue] = useState<number | string>('');
  const [maxValue, setMaxValue] = useState<number>(0);
  const [value, setValue] = useState<string>(localStorage.getItem('walletName') || '');
  const [symbolName, setSymbolName] = useState<string>('');

  const validateNumbers = e => {
    if (INPUT_VALIDATION.digits.test(e)) {
      e <= maxValue ? setInputValue(e) : setInputValue(maxValue);
    } else {
      setInputValue(0);
    }
  };

  const arr: any = localStorage.getItem('contacts');

  const contacts = JSON.parse(arr);

  const handleCancel = useCallback(() => {
    setHash('');
    setExecuted(false);
    setTransactionModal({ title: '', input: false, action: false });
  }, [setExecuted, setTransactionModal, setHash]);

  const setWalletName = useCallback(() => {
    if (value && value !== ethId) {
      localStorage.setItem('walletName', value);
    } else {
      setValue(localStorage.getItem('walletName') || ethId);
    }
  }, [ethId, value]);

  return (
    <>
      <Modal visible={false} classSpecifier="add-contact" background={true} cancelAction={() => null}>
        <SaveContacts addressValue={addressValue} addressInput={false} />
      </Modal>
      <div className="transaction-wrapper">
        {isExecuted ? (
          <>
            <p>{typeof hash === 'string' ? hash : hash?.hash}</p>
          </>
        ) : (
          <>
            {isLoading ? ( // need to remove later
              <>
                <span>Loading...</span>
                <button
                  onClick={() => {
                    handleCancel();
                    setWalletName();
                  }}
                ></button>
              </>
            ) : (
              <>
                <button onClick={() => handleCancel()} className="transaction-back"></button>
                <h2 className="transaction-title">{title}</h2>
                {isInput && (
                  <>
                    <span className="transaction-field-title">To address</span>
                    <div className="transaction-field">
                      <div className="currency-input-wrapper">
                        <input
                          placeholder="Ox address, ENS or contact name"
                          value={addressValue}
                          onChange={onChangeAddress}
                          className="currency-input-address"
                        />
                        <button className="add-contact-button-input" onClick={() => setModal('add-contact')}>
                          <span></span>
                          <p>Save</p>
                        </button>
                        <select
                          className="contacts-selector"
                          onChange={e => {
                            setToken(e.toString());
                            setMaxValue(+e.target.value);
                          }}
                        >
                          {contacts?.length &&
                            contacts.map(({ name, address }) => (
                              <option key={address} value={name}>
                                {name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                <span className="transaction-field-title">Amount / asset</span>
                <div className="transaction-field">
                  <div className="currency-input-wrapper border">
                    <input
                      placeholder="0.00"
                      className={'currency-input'}
                      onChange={e => {
                        validateNumbers(e.target.value);
                        onChangeAmount(+e.target.value);
                      }}
                      value={inputValue}
                    />
                    <select
                      className="currency-selector"
                      onChange={e => {
                        setToken(e.toString());
                        setMaxValue(+e.target.value);
                        const id = e.target?.selectedIndex;
                        setSymbolName(e.target.options[id].text);
                      }}
                    >
                      {balances?.length &&
                        balances.map(({ address, balance, symbol }) => (
                          <option key={address} value={balance}>
                            {symbol}
                          </option>
                        ))}
                    </select>
                  </div>
                  {zkBalances?.length && (
                    <div className="currency-input-wrapper" key={token}>
                      <span>~${price * (maxValue ? maxValue : zkBalances[0].balance)}</span>
                      <span>
                        Balance: {maxValue ? maxValue : zkBalances[0].balance}{' '}
                        {symbolName ? symbolName : zkBalances[0].symbol}
                      </span>
                    </div>
                  )}
                </div>
                <button className="btn submit-button" onClick={() => transactionAction(token)}>
                  {title}
                </button>
                <p key={maxValue} className="transaction-fee">
                  Fee:{' '}
                  {zkBalances?.length && (
                    <span>
                      {maxValue ? maxValue * 0.001 : zkBalances[0].balance * 0.001}{' '}
                      {symbolName ? symbolName : zkBalances[0].symbol}
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
