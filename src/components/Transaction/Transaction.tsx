import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';

import DataList from 'components/DataList/DataList';
import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import Spinner from 'components/Spinner/Spinner';

import { ITransactionProps } from './Types';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { INPUT_VALIDATION } from 'constants/regExs';
import { WIDTH_BP, ZK_FEE_MULTIPLIER } from 'constants/magicNumbers';
import { ZK_EXPLORER } from 'constants/links';

import { useRootData } from 'hooks/useRootData';

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
  propsMaxValue,
  propsSymbolName,
  propsToken,
  setHash,
  setExecuted,
  setLoading,
  setTransactionType,
  setSymbol,
  title,
  transactionAction,
  type,
}): JSX.Element => {
  const {
    ethId,
    hintModal,
    searchBalances,
    searchContacts,
    setBalances,
    setContacts,
    setError,
    setHintModal,
    setModal,
    setUnlocked,
    setWalletAddress,
    unlocked,
    walletAddress,
    zkBalancesLoaded,
    zkWallet,
  } = useRootData(
    ({
      ethId,
      hintModal,
      searchBalances,
      searchContacts,
      setBalances,
      setContacts,
      setError,
      setHintModal,
      setModal,
      setUnlocked,
      setWalletAddress,
      unlocked,
      walletAddress,
      zkBalancesLoaded,
      zkWallet,
    }) => ({
      ethId: ethId.get(),
      hintModal: hintModal.get(),
      searchBalances: searchBalances.get(),
      searchContacts: searchContacts.get(),
      setBalances,
      setContacts,
      setHintModal,
      setError,
      setModal,
      setUnlocked,
      setWalletAddress,
      unlocked: unlocked.get(),
      walletAddress: walletAddress.get(),
      zkBalancesLoaded: zkBalancesLoaded.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const body = document.querySelector('#body');
  const dataPropertySymbol = 'symbol';
  const dataPropertyName = 'name';
  const myRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [filteredContacts, setFilteredContacts] = useState<any>([]);
  const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
  const [isContactsListOpen, openContactsList] = useState<boolean>(false);
  const [isHintUnlocked, setHintUnlocked] = useState<string>('');
  const [inputValue, setInputValue] = useState<number | string>();
  const [maxValue, setMaxValue] = useState<number>(
    propsMaxValue ? propsMaxValue : 0,
  );
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedBalance, setSelectedBalance] = useState<any>();
  const [selectedContact, setSelectedContact] = useState<any>();
  const [symbolName, setSymbolName] = useState<string>(
    propsSymbolName ? propsSymbolName : '',
  );
  const [token, setToken] = useState<string>(propsToken ? propsToken : '');
  const [unlockFau, setUnlockFau] = useState<boolean>(false);
  const [value, setValue] = useState<string>(
    localStorage.getItem('walletName') || '',
  );
  const bigNumberMultiplier = Math.pow(10, 18);

  const validateNumbers = useCallback(
    e => {
      if (INPUT_VALIDATION.digits.test(e)) {
        if (e <= maxValue || e === 0) {
          setInputValue(e);
          if (inputValue === undefined && e === 0) {
            setInputValue(0);
          }
          const amountNumber = ethers.utils.parseEther(e.toString());
          title === 'Deposit'
            ? onChangeAmount(
                +amountNumber + fee >
                  +ethers.utils.parseEther(maxValue.toString())
                  ? +amountNumber - fee - 2 * ZK_FEE_MULTIPLIER * fee
                  : +amountNumber,
              )
            : onChangeAmount(
                +amountNumber + fee >
                  +ethers.utils.parseEther(maxValue.toString())
                  ? +amountNumber - fee
                  : +amountNumber,
              );
        } else {
          setInputValue(maxValue);
          title === 'Deposit'
            ? onChangeAmount(
                +ethers.utils.parseEther(maxValue.toString()) -
                  fee -
                  2 * ZK_FEE_MULTIPLIER * fee,
              )
            : onChangeAmount(
                +ethers.utils.parseEther(maxValue.toString()) - fee,
              );
        }
      }
    },
    [
      bigNumberMultiplier,
      fee,
      inputValue,
      maxValue,
      onChangeAmount,
      setInputValue,
      title,
    ],
  );

  const arr: any = localStorage.getItem(`contacts${zkWallet?.address()}`);
  const contacts = JSON.parse(arr);

  const handleFilterContacts = useCallback(
    e => {
      const searchValue = contacts.filter(el => {
        return ADDRESS_VALIDATION['eth'].test(e) &&
          el.address.toLowerCase().includes(e.toLowerCase())
          ? (setSelectedContact(el.name),
            handleSelect(el.name),
            setWalletAddress([el.name, el.address]),
            onChangeAddress(el.address))
          : el.name.toLowerCase().includes(e.toLowerCase());
      });
      setFilteredContacts(searchValue);
    },
    [addressValue, contacts, setFilteredContacts],
  );

  const handleCancel = useCallback(() => {
    setTransactionType(undefined);
    setHash('');
    setExecuted(false);
    setWalletAddress([]);
    setLoading(false);
  }, [setExecuted, setHash, setLoading, setTransactionType, setWalletAddress]);

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
    [isBalancesListOpen, isContactsListOpen, onChangeAddress],
  );

  const handleClickOutside = useCallback(
    e => {
      if (e.target.getAttribute('data-name')) {
        e.stopPropagation();
        openContactsList(false);
        openBalancesList(false);
        body?.classList.remove('fixed-b');
      }
    },
    [body],
  );

  const handleSave = useCallback(() => {
    if (addressValue && ADDRESS_VALIDATION['eth'].test(addressValue)) {
      setModal('add-contact');
    } else {
      setError(
        `Error: "${addressValue}" doesn't match ethereum address format`,
      );
    }
  }, [addressValue, setError, setModal]);

  const handleUnlock = useCallback(async () => {
    setLoading(true);
    const changePubkey = await zkWallet?.setSigningKey();
    const receipt = await changePubkey?.awaitReceipt();
    setUnlocked(!!receipt);
    setLoading(false);
  }, [setLoading, zkWallet]);

  useEffect(() => {
    if (token && token === 'ETH') {
      setUnlockFau(true);
    }
    if (title === 'Withdraw' && zkWallet && !walletAddress[1]) {
      setWalletAddress(['You', zkWallet?.address()]);
      onChangeAddress(zkWallet?.address());
    }
    if (token && zkWallet && token !== 'ETH') {
      zkWallet.isERC20DepositsApproved(token).then(res => setUnlockFau(res));
    }
    ethers
      .getDefaultProvider()
      .getGasPrice()
      .then(res => res.toString())
      .then(data => setFee(+data));
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [
    addressValue,
    balances,
    body,
    fee,
    handleClickOutside,
    isBalancesListOpen,
    isContactsListOpen,
    onChangeAddress,
    selected,
    setUnlockFau,
    setWalletAddress,
    title,
    unlockFau,
    walletAddress,
    zkWallet,
  ]);

  const handleShowHint = useCallback(
    text => {
      setHintUnlocked(text);
      setTimeout(() => {
        setHintUnlocked('');
      }, 3000);
    },
    [setHintUnlocked],
  );

  const handleUnlockERC = useCallback(() => {
    setLoading(true);
    zkWallet
      ?.approveERC20TokenDeposits(token)
      .then(res => res)
      .then(data => data);
    const setUnlocked = async () => {
      const checkApprove = await zkWallet
        ?.isERC20DepositsApproved(token)
        .then(res => res);
      if (checkApprove) {
        setUnlockFau(checkApprove);
        setLoading(false);
      }
    };
    setUnlocked();
    if (!unlockFau) {
      setInterval(() => {
        setUnlocked();
      }, 3000);
    }
  }, [setUnlockFau, token, unlockFau, zkWallet]);

  const handleInputWidth = useCallback(e => {
    const el = myRef.current;
    if (el) {
      el.style.width = (e.toString().length + 1) * 16 + 'px';
    }
  }, []);

  const handleSumbit = useCallback(() => {
    if (
      (ADDRESS_VALIDATION['eth'].test(addressValue) || title === 'Deposit') &&
      selectedBalance &&
      inputValue &&
      +inputValue > 0 &&
      unlockFau
    ) {
      transactionAction(token, type);
    }
    if (!selectedBalance || (inputValue && +inputValue <= 0) || !inputValue) {
      setError('Please select token and amount value');
    }
    if (!ADDRESS_VALIDATION['eth'].test(addressValue) && title !== 'Deposit') {
      setError('Adress does not match ethereum address format');
    }
  }, [inputValue, selectedBalance, setError, unlockFau]);

  return (
    <>
      <div
        data-name='modal-wrapper'
        className={`modal-wrapper ${
          isContactsListOpen || isBalancesListOpen ? 'open' : 'closed'
        }`}
      ></div>
      <Modal visible={false} classSpecifier='add-contact' background={true}>
        <SaveContacts
          title='Add contact'
          addressValue={addressValue}
          addressInput={false}
        />
      </Modal>
      <div
        className={`assets-wrapper ${
          isContactsListOpen || isBalancesListOpen ? 'open' : 'closed'
        }`}
      >
        {isContactsListOpen && (
          <DataList
            setValue={setContacts}
            dataProperty={dataPropertyName}
            data={contacts}
            title='Select contact'
            visible={true}
          >
            <button
              onClick={() => {
                openContactsList(false);
                body?.classList.remove('fixed-b');
              }}
              className='close-icon'
            ></button>
            <div className='assets-border-bottom'></div>
            {searchContacts ? (
              searchContacts.map(({ address, name }) => (
                <div
                  className='balances-contact'
                  key={name}
                  onClick={() => {
                    handleSelect(name);
                    setWalletAddress([name, address]);
                    onChangeAddress(address);
                    openContactsList(false);
                    body?.classList.remove('fixed-b');
                  }}
                >
                  <div className='balances-contact-left'>
                    <p className='balances-contact-name'>{name}</p>
                    <span className='balances-contact-address'>
                      {window?.innerWidth > WIDTH_BP
                        ? address
                        : address?.replace(
                            address?.slice(14, address?.length - 4),
                            '...',
                          )}
                    </span>
                  </div>
                  <div className='balances-contact-right'>
                    <></>
                  </div>
                </div>
              ))
            ) : (
              <p>You don't have contacts yet...</p>
            )}
          </DataList>
        )}
        {isBalancesListOpen && (
          <DataList
            setValue={setBalances}
            dataProperty={dataPropertySymbol}
            data={balances}
            title='Select asset'
            visible={true}
          >
            <button
              onClick={() => {
                openBalancesList(false);
                body?.classList.remove('fixed-b');
              }}
              className='close-icon'
            ></button>
            {!!searchBalances.length ? (
              searchBalances.map(({ address, symbol, balance }) => (
                <div
                  onClick={() => {
                    setToken(!!+address ? address : symbol);
                    setMaxValue(balance);
                    setSymbolName(symbol);
                    setSymbol(symbol);
                    handleSelect(symbol);
                    openBalancesList(false);
                    setSelected(true);
                    body?.classList.remove('fixed-b');
                  }}
                  key={address}
                  className='balances-token'
                >
                  <div className='balances-token-left'>
                    <div className={`logo ${symbol}`}></div>
                    <div className='balances-token-name'>
                      <p>{symbol}</p>
                      <span>
                        {symbol === 'ETH' && <>Ethereum</>}
                        {symbol === 'DAI' && <>Dai</>}
                        {symbol === 'FAU' && <>Faucet</>}
                      </span>
                    </div>
                  </div>
                  <div className='balances-token-right'>
                    <span>
                      balance:{' '}
                      <p className='datalist-balance'>
                        {parseFloat(balance.toFixed(8).toString())}
                      </p>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>
                No balances yet, please make a deposit or request money from
                someone!
              </p>
            )}
          </DataList>
        )}
      </div>
      <div className='transaction-wrapper'>
        {isExecuted ? (
          <>
            <button
              onClick={() => {
                handleCancel();
              }}
              className='transaction-back'
            ></button>
            <h2 className='transaction-title'>
              {title} {title === 'Withdraw' ? 'initiated' : 'successful!'}
            </h2>
            <span className='transaction-field-title'>
              {title === 'Send' && <>Transfered into</>}
              {title === 'Withdraw' && <>Withdrawn from</>}
              {title === 'Deposit' && <>Deposited to</>} zkSync:{' '}
              <p className='transaction-field-amount'>
                {inputValue} {symbolName}
              </p>
            </span>
            <p className='transaction-hash'>
              {'Tx hash: '}
              <a
                target='_blank'
                href={`${ZK_EXPLORER}/${
                  typeof hash === 'string' ? hash : hash?.hash
                }`}
              >
                {typeof hash === 'string' ? hash : hash?.hash}
              </a>
            </p>
            <button
              className='btn submit-button'
              onClick={() => {
                handleCancel();
                setWalletAddress([]);
                setTransactionType(undefined);
              }}
            >
              Go to my wallet
            </button>
          </>
        ) : (
          <>
            {unlocked === undefined || isLoading ? (
              <>
                {isLoading && (
                  <>
                    <h1>{isLoading && !unlockFau ? 'Unlocking' : title}</h1>
                    <p>
                      {hintModal
                        ? hintModal
                        : 'Follow the instructions in the popup'}
                    </p>
                    <Spinner />
                    <button
                      className='btn submit-button'
                      onClick={() => {
                        handleCancel();
                        setWalletName();
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {unlocked === undefined && (
                  <>
                    <Spinner />
                    <button
                      className='btn submit-button'
                      onClick={() => {
                        handleCancel();
                        setWalletName();
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleCancel();
                    setWalletAddress([]);
                    setTransactionType(undefined);
                  }}
                  className='transaction-back'
                ></button>
                <h2 className='transaction-title'>{title}</h2>
                {unlocked || title === 'Deposit' ? (
                  <>
                    {searchBalances.length || title === 'Deposit' ? (
                      <>
                        {isInput && (
                          <>
                            <span className='transaction-field-title'>
                              To address
                            </span>
                            <div
                              className={`transaction-field contacts ${ADDRESS_VALIDATION[
                                'eth'
                              ].test(addressValue)}`}
                            >
                              <div
                                className='custom-selector contacts'
                                onClick={() => {
                                  openContactsList(!isContactsListOpen);
                                  body?.classList.add('fixed-b');
                                }}
                              >
                                <div className='custom-selector-title'>
                                  <p>
                                    {walletAddress[0]
                                      ? walletAddress[0]
                                      : selectedContact}
                                  </p>
                                  {(selectedContact || walletAddress[0]) && (
                                    <div className='arrow-down'></div>
                                  )}
                                </div>
                              </div>
                              <div className='currency-input-wrapper'>
                                {ADDRESS_VALIDATION['eth'].test(
                                  addressValue,
                                ) && <span className='label-done'></span>}
                                <input
                                  placeholder='Ox address or contact name'
                                  value={
                                    title === 'Withdraw'
                                      ? zkWallet?.address()
                                      : addressValue
                                  }
                                  onChange={e => {
                                    onChangeAddress(e.target.value);
                                    handleFilterContacts(e.target.value);
                                    setWalletAddress([]);
                                  }}
                                  className='currency-input-address'
                                />
                                {ADDRESS_VALIDATION['eth'].test(addressValue) &&
                                  !selectedContact && (
                                    <button
                                      className='add-contact-button-input btn-tr'
                                      onClick={() => handleSave()}
                                    >
                                      <span></span>
                                      <p>Save</p>
                                    </button>
                                  )}
                                {((!addressValue && !walletAddress[1]) ||
                                  (!addressValue && walletAddress[1]) ||
                                  !addressValue ||
                                  walletAddress[1]) &&
                                !selectedContact ? (
                                  <div
                                    className={`custom-selector contacts ${
                                      selectedContact &&
                                      addressValue === walletAddress[1]
                                        ? ''
                                        : 'short'
                                    }`}
                                  >
                                    <div
                                      onClick={() => {
                                        openContactsList(!isContactsListOpen);
                                        body?.classList.add('fixed-b');
                                      }}
                                      className={`custom-selector-title ${
                                        selectedContact &&
                                        addressValue === walletAddress[1]
                                          ? ''
                                          : 'short'
                                      }`}
                                    >
                                      {(selectedContact || !walletAddress[0]) &&
                                      addressValue === walletAddress[1] ? (
                                        <p>{selectedContact}</p>
                                      ) : (
                                        <span></span>
                                      )}
                                      <div className='arrow-down'></div>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    className='cross-clear'
                                    onClick={() => {
                                      onChangeAddress('');
                                      handleFilterContacts('');
                                      setWalletAddress([]);
                                      setSelectedContact('');
                                    }}
                                  ></button>
                                )}
                              </div>
                            </div>
                            {!!filteredContacts.length &&
                              addressValue &&
                              !walletAddress[1] && (
                                <div className='transaction-contacts-list'>
                                  {filteredContacts.map(({ name, address }) => (
                                    <div
                                      className='balances-contact'
                                      key={name}
                                      onClick={() => {
                                        handleSelect(name);
                                        setWalletAddress([name, address]);
                                        onChangeAddress(address);
                                        openContactsList(false);
                                        setSelectedContact(name);
                                        body?.classList.remove('fixed-b');
                                        setFilteredContacts([]);
                                      }}
                                    >
                                      <div className='balances-contact-left'>
                                        <p className='balances-contact-name'>
                                          {name}
                                        </p>
                                        <span className='balances-contact-address'>
                                          {window?.innerWidth > WIDTH_BP
                                            ? address
                                            : address?.replace(
                                                address?.slice(
                                                  14,
                                                  address?.length - 4,
                                                ),
                                                '...',
                                              )}
                                        </span>
                                      </div>
                                      <div className='balances-contact-right'>
                                        <></>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </>
                        )}
                        <span className='transaction-field-title'>
                          Amount / asset
                        </span>
                        <div className='transaction-field balance'>
                          <div className='currency-input-wrapper border'>
                            <div className='scroll-wrapper'>
                              <input
                                placeholder='0.00'
                                className='currency-input'
                                type='number'
                                ref={myRef}
                                onChange={e => {
                                  validateNumbers(+e.target.value);
                                  setAmount(+e.target.value);
                                  handleInputWidth(+e.target.value);
                                  setInputValue(e.target.value);
                                  if (+e.target.value > maxValue) {
                                    setInputValue(maxValue);
                                    handleInputWidth(maxValue);
                                  }
                                }}
                                value={
                                  inputValue
                                    ? parseFloat(
                                        parseFloat(inputValue?.toString())
                                          .toFixed(18)
                                          .toString(),
                                      )
                                    : ''
                                }
                              />
                            </div>

                            <div className='custom-selector balances'>
                              <div
                                onClick={() => {
                                  openBalancesList(!isBalancesListOpen);
                                  body?.classList.add('fixed-b');
                                }}
                                className='custom-selector-title'
                              >
                                {symbolName ? (
                                  <p>{symbolName}</p>
                                ) : (
                                  <span>
                                    {zkBalancesLoaded ? (
                                      'Select token'
                                    ) : (
                                      <Spinner />
                                    )}
                                  </span>
                                )}

                                <div className='arrow-down'></div>
                              </div>
                            </div>
                          </div>
                          {zkBalancesLoaded &&
                            (!!balances?.length ? (
                              <div
                                className='currency-input-wrapper'
                                key={token}
                              >
                                <div className='all-balance-wrapper'>
                                  <button
                                    className='all-balance btn-tr'
                                    onClick={() => {
                                      setInputValue(+maxValue);
                                      onChangeAmount(
                                        (+maxValue - 0.0003) *
                                          bigNumberMultiplier -
                                          2 * ZK_FEE_MULTIPLIER * fee,
                                      );
                                      handleInputWidth(maxValue);
                                    }}
                                  >
                                    Max: {maxValue ? maxValue.toFixed(6) : '0'}{' '}
                                    {symbolName ? symbolName : ''}
                                  </button>
                                </div>
                                <span>
                                  ~$
                                  {
                                    +(
                                      +(price && !!price[selectedBalance]
                                        ? price[selectedBalance]
                                        : 1) * (maxValue ? maxValue : 0)
                                    ).toFixed(2)
                                  }
                                </span>
                              </div>
                            ) : (
                              <div
                                className='currency-input-wrapper'
                                key={token}
                              >
                                <span>You have no balances</span>
                              </div>
                            ))}
                        </div>
                        <div className={`hint-unlocked ${!!isHintUnlocked}`}>
                          {isHintUnlocked}
                        </div>
                        {title === 'Deposit' &&
                          token !== 'ETH' &&
                          selectedBalance && (
                            <>
                              <div
                                className={`hint-unlocked ${!!isHintUnlocked}`}
                              >
                                {isHintUnlocked}
                              </div>
                              <div className='fau-unlock-wrapper'>
                                <div className='fau-unlock-wrapper'>
                                  {unlockFau ? (
                                    <p>
                                      {symbolName.length
                                        ? symbolName
                                        : balances?.length &&
                                          balances[0].symbol}{' '}
                                      token unlocked
                                    </p>
                                  ) : (
                                    <p>
                                      Unlock{' '}
                                      {symbolName.length
                                        ? symbolName
                                        : balances?.length &&
                                          balances[0].symbol}{' '}
                                      token
                                    </p>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleShowHint(
                                        'You need to call ERC20.approve() for our contract once in order to authorize token deposits.',
                                      )
                                    }
                                    className='hint-question-mark'
                                  >
                                    ?
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    !unlockFau
                                      ? handleUnlockERC()
                                      : handleShowHint(
                                          'Already unlocked. This only needs to be done once per token.',
                                        )
                                  }
                                  className={`fau-unlock-tocken ${unlockFau}`}
                                >
                                  <span
                                    className={`fau-unlock-tocken-circle ${unlockFau}`}
                                  ></span>
                                </button>
                              </div>
                            </>
                          )}
                        <button
                          className={`btn submit-button ${
                            !unlockFau && title === 'Deposit' ? 'disabled' : ''
                          }`}
                          onClick={handleSumbit}
                        >
                          <span
                            className={`submit-label ${title} ${
                              !unlockFau && title === 'Deposit'
                                ? unlockFau
                                : true
                            }`}
                          ></span>
                          {title}
                        </button>
                        <p key={maxValue} className='transaction-fee'>
                          Fee:{' '}
                          {balances?.length && (
                            <span>
                              {amount < maxValue
                                ? parseFloat(
                                    (amount * 0.001).toFixed(10).toString(),
                                  )
                                : parseFloat(
                                    (maxValue * 0.001).toFixed(10).toString(),
                                  )}{' '}
                              {symbolName ? symbolName : balances[0].symbol}
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          No balances yet, please make a deposit or request
                          money from someone!
                        </p>
                        <button
                          className='btn submit-button'
                          onClick={() => setTransactionType('deposit')}
                        >
                          Deposit
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className='info-block center'>
                      <p>
                        To control your account you need to unlock it once by
                        registering your public key.
                      </p>
                    </div>
                    <button
                      className='btn submit-button'
                      onClick={handleUnlock}
                    >
                      <span className='submit-label unlock'></span>
                      Unlock
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Transaction;
