import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';

import DataList from 'components/DataList/DataList';
import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import Spinner from 'components/Spinner/Spinner';

import { ITransactionProps } from './Types';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { INPUT_VALIDATION } from 'constants/regExs';
import { useAutoFocus } from 'hooks/useAutoFocus';
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
  const [conditionError, setConditionError] = useState('');
  const [fee, setFee] = useState<number>(0);
  const [filteredContacts, setFilteredContacts] = useState<any>([]);
  const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
  const [isContactsListOpen, openContactsList] = useState<boolean>(false);
  const [isHintUnlocked, setHintUnlocked] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<number>(
    propsMaxValue ? propsMaxValue : 0,
  );
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedBalance, setSelectedBalance] = useState<any | undefined>();
  const [selectedContact, setSelectedContact] = useState<any | undefined>();
  const [symbolName, setSymbolName] = useState<string>(
    propsSymbolName ? propsSymbolName : '',
  );
  const [token, setToken] = useState<string>(propsToken ? propsToken : '');
  const [unlockFau, setUnlockFau] = useState<boolean>(false);
  const [value, setValue] = useState<string>(
    localStorage.getItem('walletName') || '',
  );
  const bigNumberMultiplier = Math.pow(10, 18);

  const submitCondition =
    (ADDRESS_VALIDATION['eth'].test(addressValue) || title === 'Deposit') &&
    selectedBalance &&
    inputValue &&
    +inputValue > 0 &&
    unlockFau &&
    +inputValue <= maxValue;

  const validateNumbers = useCallback(
    e => {
      const amountNumber = ethers.utils.parseEther(e.toString());
      if (INPUT_VALIDATION.digits.test(e)) {
        setInputValue(e);
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
      setConditionError(
        `Error: "${addressValue}" doesn't match ethereum address format`,
      );
    }
  }, [addressValue, setConditionError, setModal]);

  const handleUnlock = useCallback(async () => {
    setHintModal('Follow the instructions in the pop up');
    setLoading(true);
    const changePubkey = await zkWallet?.setSigningKey();
    setHintModal('Confirmed! \n Waiting for transaction to be ended');
    const receipt = await changePubkey?.awaitReceipt();
    setUnlocked(!!receipt);
    setLoading(false);
  }, [setLoading, zkWallet]);

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
    [
      addressValue,
      contacts,
      handleSelect,
      onChangeAddress,
      setFilteredContacts,
      setSelectedContact,
      setWalletAddress,
    ],
  );

  const handleCancel = useCallback(() => {
    setTransactionType(undefined);
    setHash('');
    setExecuted(false);
    setWalletAddress([]);
    setLoading(false);
    setSelectedBalance('');
    setSelectedContact('');
    onChangeAddress('');
    handleFilterContacts('');
  }, [
    handleFilterContacts,
    onChangeAddress,
    setExecuted,
    setHash,
    setLoading,
    setSelectedBalance,
    setSelectedContact,
    setTransactionType,
    setWalletAddress,
  ]);

  useEffect(() => {
    if ((token && token === 'ETH') || symbolName === 'ETH') {
      setUnlockFau(true);
    }
    if (balances?.length === 1) {
      setToken(
        !!balances[0].address ? balances[0].address : balances[0].symbol,
      );
      setMaxValue(balances[0].balance);
      setSelectedBalance(balances[0].symbol);
      setSymbolName(balances[0].symbol);
      setSymbol(balances[0].symbol);
    }
    if (
      title === 'Withdraw' &&
      zkWallet &&
      walletAddress.length < 2 &&
      !walletAddress[1] &&
      selectedContact !== null
    ) {
      setWalletAddress(['Own account', zkWallet?.address()]);
      onChangeAddress(zkWallet?.address());
    }
    if (token && zkWallet && token !== 'ETH') {
      zkWallet.isERC20DepositsApproved(token).then(res => setUnlockFau(res));
    }
    if (hintModal === 'denied') {
      handleCancel();
      setWalletName();
      setHintModal('');
    }
    if (
      ADDRESS_VALIDATION['eth'].test(addressValue) &&
      !selectedContact &&
      title !== 'Withdraw'
    ) {
      contacts?.filter(el => {
        if (el.address.toLowerCase().includes(addressValue.toLowerCase())) {
          setSelectedContact(el.name);
          handleSelect(el.name);
          setWalletAddress([el.name, el.address]);
          onChangeAddress(el.address);
        }
      });
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
    contacts,
    body,
    fee,
    filteredContacts,
    handleCancel,
    handleClickOutside,
    handleSelect,
    isBalancesListOpen,
    isContactsListOpen,
    onChangeAddress,
    selected,
    selectedContact,
    setFilteredContacts,
    setMaxValue,
    setSelected,
    setModal,
    setSelectedContact,
    setSymbol,
    setSymbolName,
    setToken,
    setUnlockFau,
    setWalletName,
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
    if (submitCondition) {
      transactionAction(token, type);
    }
    if (!selectedBalance || (inputValue && +inputValue <= 0) || !inputValue) {
      setConditionError('Please select token and amount value');
    }
    if (!ADDRESS_VALIDATION['eth'].test(addressValue) && title !== 'Deposit') {
      setConditionError('Adress does not match ethereum address format');
    }
  }, [addressValue, inputValue, selectedBalance, setConditionError, unlockFau]);

  return (
    <>
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
                    setConditionError('');
                    setSelected(true);
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
                  <div className='balances-contact-right'></div>
                </div>
              ))
            ) : (
              <p>{"You don't have contacts yet..."}</p>
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
                    setConditionError('');
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
                        {symbol === 'ETH' && <>{'Ethereum'}</>}
                        {symbol === 'DAI' && <>{'Dai'}</>}
                        {symbol === 'FAU' && <>{'Faucet'}</>}
                      </span>
                    </div>
                  </div>
                  <div className='balances-token-right'>
                    <span>
                      {'balance: '}
                      <p className='datalist-balance'>
                        {parseFloat(balance.toFixed(8).toString())}
                      </p>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>
                {
                  'No balances yet, please make a deposit or request money from someone!'
                }
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
              {title === 'Send' && <>{'Transfered into'}</>}
              {title === 'Withdraw' && <>{'Withdrawn from'}</>}
              {title === 'Deposit' && <>{'Deposited to'}</>} {'zkSync: '}
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
              {'Go to my wallet'}
            </button>
          </>
        ) : unlocked === undefined || isLoading ? (
          <>
            {isLoading && (
              <>
                {isLoading && (
                  <>
                    <h1>{isLoading && !unlockFau ? 'Unlocking' : title}</h1>
                    {!!hintModal
                      ? hintModal?.split('\n').map((text, key) => (
                          <p className='transaction-hint' key={key}>
                            {text}
                          </p>
                        ))
                      : 'Follow the instructions in the pop up'}

                    <Spinner />
                    <button
                      className='btn submit-button'
                      onClick={() => {
                        handleCancel();
                        setWalletName();
                      }}
                    >
                      {'Cancel'}
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
                      {'Cancel'}
                    </button>
                  </>
                )}
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
                  {'Cancel'}
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
              searchBalances.length || title === 'Deposit' ? (
                <>
                  {isInput && (
                    <>
                      <span className='transaction-field-title'>
                        {'To address'}
                      </span>
                      <div
                        className={`transaction-field contacts ${ADDRESS_VALIDATION[
                          'eth'
                        ].test(addressValue)}`}
                      >
                        <div
                          className='custom-selector contacts'
                          onClick={() => {
                            if (walletAddress[0] || selectedContact) {
                              openContactsList(!isContactsListOpen);
                              body?.classList.add('fixed-b');
                            }
                          }}
                        >
                          <div
                            className={`custom-selector-title ${
                              walletAddress[0] || selectedContact
                                ? ''
                                : 'disabled'
                            }`}
                          >
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
                          {ADDRESS_VALIDATION['eth'].test(addressValue) && (
                            <span className='label-done'></span>
                          )}
                          <input
                            placeholder='Ox address or contact name'
                            value={addressValue}
                            onChange={e => {
                              onChangeAddress(e.target.value);
                              handleFilterContacts(e.target.value);
                              setWalletAddress([]);
                              if (
                                ADDRESS_VALIDATION['eth'].test(addressValue)
                              ) {
                                setConditionError('');
                              }
                            }}
                            className='currency-input-address'
                          />
                          {ADDRESS_VALIDATION['eth'].test(addressValue) &&
                            !selectedContact &&
                            !walletAddress[0] && (
                              <button
                                className='add-contact-button-input btn-tr'
                                onClick={() => handleSave()}
                              >
                                <span></span>
                                <p>{'Save'}</p>
                              </button>
                            )}
                          {!addressValue ? (
                            <div
                              className={`custom-selector contacts ${
                                selectedContact &&
                                walletAddress.length === 2 &&
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
                                  walletAddress.length === 2 &&
                                  addressValue === walletAddress[1]
                                    ? ''
                                    : 'short'
                                }`}
                              >
                                {(selectedContact || !walletAddress[0]) &&
                                walletAddress.length === 2 &&
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
                                setSelectedContact(null);
                              }}
                            ></button>
                          )}
                        </div>
                      </div>
                      {!!filteredContacts.length &&
                        addressValue &&
                        walletAddress.length < 2 && (
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
                                  setConditionError('');
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
                                <div className='balances-contact-right'></div>
                              </div>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                  <span className='transaction-field-title'>
                    {'Amount / asset'}
                  </span>
                  <div className='transaction-field balance'>
                    <div className='currency-input-wrapper border'>
                      <div className='scroll-wrapper'>
                        <input
                          placeholder={selectedBalance ? '0.00' : ''}
                          className='currency-input'
                          type='number'
                          ref={myRef}
                          onChange={e => {
                            validateNumbers(+e.target.value);
                            setAmount(+e.target.value);
                            handleInputWidth(+e.target.value);
                            setInputValue(e.target.value);
                            if (!!inputValue && +inputValue < maxValue) {
                              setConditionError('');
                            }
                          }}
                          value={inputValue.toString().replace(/-/g, '')}
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
                              {zkBalancesLoaded ? 'Select token' : <Spinner />}
                            </span>
                          )}

                          <div className='arrow-down'></div>
                        </div>
                      </div>
                    </div>
                    {zkBalancesLoaded &&
                      (!!balances?.length ? (
                        <div className='currency-input-wrapper' key={token}>
                          <div className='all-balance-wrapper'>
                            {selectedBalance && (
                              <span>
                                {'~$'}
                                {
                                  +(
                                    +(price && !!price[selectedBalance]
                                      ? price[selectedBalance]
                                      : 1) *
                                    (inputValue ? Math.abs(+inputValue) : 0)
                                  ).toFixed(2)
                                }
                              </span>
                            )}
                          </div>
                          <button
                            className='all-balance btn-tr'
                            onClick={() => {
                              setInputValue(maxValue.toString());
                              onChangeAmount(
                                (+maxValue - 0.0003) * bigNumberMultiplier -
                                  2 * ZK_FEE_MULTIPLIER * fee,
                              );
                              handleInputWidth(maxValue);
                            }}
                          >
                            {selectedBalance && (
                              <>
                                {'Max:'}
                                {maxValue ? maxValue.toFixed(6) : '0'}{' '}
                              </>
                            )}
                            {symbolName ? symbolName : ''}
                          </button>
                        </div>
                      ) : (
                        <div className='currency-input-wrapper' key={token}>
                          <span>{'You have no balances'}</span>
                        </div>
                      ))}
                  </div>
                  <div className={`hint-unlocked ${!!isHintUnlocked}`}>
                    {isHintUnlocked}
                  </div>
                  {title === 'Deposit' && token !== 'ETH' && selectedBalance && (
                    <>
                      <div className={`hint-unlocked ${!!isHintUnlocked}`}>
                        {isHintUnlocked}
                      </div>
                      <div className='fau-unlock-wrapper'>
                        <div className='fau-unlock-wrapper'>
                          {unlockFau ? (
                            <p>
                              {symbolName.length
                                ? symbolName
                                : balances?.length && balances[0].symbol}{' '}
                              {'token unlocked'}
                            </p>
                          ) : (
                            <p>
                              {'Unlock'}{' '}
                              {symbolName.length
                                ? symbolName
                                : balances?.length && balances[0].symbol}{' '}
                              {'token'}
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
                            {'?'}
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
                  <div className='error-container'>
                    <p
                      className={`error-text ${
                        (!!inputValue &&
                          selectedBalance &&
                          +inputValue >= maxValue) ||
                        !!conditionError
                          ? 'visible'
                          : ''
                      }`}
                    >
                      {!!inputValue && selectedBalance && +inputValue > maxValue
                        ? 'Not enough balance'
                        : conditionError}
                    </p>
                  </div>

                  <button
                    className={`btn submit-button ${
                      (!unlockFau && title === 'Deposit') ||
                      !inputValue ||
                      (!!inputValue && +inputValue > maxValue) ||
                      !submitCondition
                        ? 'disabled'
                        : ''
                    }`}
                    onClick={handleSumbit}
                  >
                    <span
                      className={`submit-label ${title} ${
                        submitCondition ? true : false
                      }`}
                    ></span>
                    {title}
                  </button>
                  <div className='transaction-fee-wrapper'>
                    <p key={maxValue} className='transaction-fee'>
                      {selectedBalance && submitCondition && (
                        <>
                          {'Fee:'}{' '}
                          {balances?.length && (
                            <span>
                              {+inputValue <= maxValue
                                ? parseFloat(
                                    (amount * 0.001).toFixed(8).toString(),
                                  )
                                : parseFloat(
                                    (maxValue * 0.001).toFixed(8).toString(),
                                  )}{' '}
                              {symbolName ? symbolName : balances[0].symbol}
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {
                      'No balances yet, please make a deposit or request money from someone!'
                    }
                  </p>
                  <button
                    className='btn submit-button'
                    onClick={() => setTransactionType('deposit')}
                  >
                    {'Deposit'}
                  </button>
                </>
              )
            ) : (
              <>
                <div className='info-block center'>
                  <p>
                    {
                      'To control your account you need to unlock it once by registering your public key.'
                    }
                  </p>
                </div>
                <button className='btn submit-button' onClick={handleUnlock}>
                  <span className='submit-label unlock'></span>
                  {' Unlock'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Transaction;
