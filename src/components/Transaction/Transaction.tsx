import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import makeBlockie from 'ethereum-blockies-base64';
import { observer } from 'mobx-react-lite';

import { DataList } from 'components/DataList/DataListNew';
import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import Spinner from 'components/Spinner/Spinner';
import { CanceledTx } from './CanceledTx';
import { ContactSelectorFlat } from './ContactSelectorFlat';
import { FilteredContactList } from './FilteredContactList';
import { ExecutedTx } from './ExecutedTx';
import { LoadingTx } from './LoadingTx';
import { LockedTx } from './LockedTx';

import { ITransactionProps } from './Types';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { INPUT_VALIDATION } from 'constants/regExs';
import { WIDTH_BP, ZK_FEE_MULTIPLIER } from 'constants/magicNumbers';

import { useCancelable } from 'hooks/useCancelable';
import { useStore } from 'src/store/context';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

import { loadTokens } from 'src/utils';

import './Transaction.scss';

const Transaction: React.FC<ITransactionProps> = observer(
  ({
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
    const store = useStore();

    const {
      ethId,
      hint,
      searchBalances,
      searchContacts,
      syncProvider,
      syncWallet,
      tokens,
      unlocked,
      walletAddress,
      zkBalances,
      zkBalancesLoaded,
      zkWallet,
      accountState,
    } = store;

    const cancelable = useCancelable();

    const body = document.querySelector('#body');
    const myRef = useRef<HTMLInputElement>(null);

    const [amount, setAmount] = useState<number>(0);
    const [conditionError, setConditionError] = useState('');
    const [gas, setGas] = useState<any>(0);
    const [fee, setFee] = useState<any>();
    const [filteredContacts, setFilteredContacts] = useState<any>([]);
    const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
    const [isContactsListOpen, openContactsList] = useState<boolean>(false);
    const [isHintUnlocked, setHintUnlocked] = useState<string>('');
    const [isUnlockingProcess, setUnlockingProcess] = useState<boolean>(false);
    const [isAccountUnlockingProcess, setAccountUnlockingProcess] = useState<
      boolean
    >(false);
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

    const [refreshTimer, setRefreshTimer] = useState<number | null>(null);

    const history = useHistory();

    const refreshBalances = useCallback(async () => {
      if (zkWallet && syncProvider && syncWallet && accountState) {
        await cancelable(
          loadTokens(syncProvider, syncWallet, accountState),
        ).then(async res => {
          if (JSON.stringify(zkBalances) !== JSON.stringify(res.zkBalances)) {
            store.zkBalances = res.zkBalances;
            await cancelable(zkWallet?.getAccountState()).then((res: any) => {
              store.verified = res?.verified.balances;
              if (res?.id) {
                zkWallet?.isSigningKeySet().then(data => {
                  store.unlocked = data;
                });
              } else {
                store.unlocked = true;
              }
            });
          }
          if (JSON.stringify(tokens) !== JSON.stringify(res.tokens)) {
            store.tokens = res.tokens;
          }
        });
      }
      const timeout = setTimeout(refreshBalances, 2000);
      setRefreshTimer(timeout as any);
    }, [
      accountState,
      syncProvider,
      syncWallet,
      zkWallet,
      zkBalances,
      store,
      tokens,
      title,
    ]);

    const submitCondition =
      (ADDRESS_VALIDATION['eth'].test(addressValue) ||
        (title === 'Deposit' && unlockFau)) &&
      selectedBalance &&
      inputValue &&
      +inputValue > 0 &&
      +inputValue <= maxValue;

    const validateNumbers = useCallback(
      e => {
        const amountNumber = ethers.utils.parseEther(e.toString());
        if (INPUT_VALIDATION.digits.test(e)) {
          setInputValue(e);
          title === 'Deposit'
            ? onChangeAmount(
                +amountNumber + gas >
                  +ethers.utils.parseEther(maxValue.toString())
                  ? +amountNumber
                  : +amountNumber,
              )
            : onChangeAmount(
                +amountNumber + fee >=
                  +ethers.utils.parseEther(maxValue.toString())
                  ? +amountNumber
                  : +amountNumber,
              );
        }
      },
      [fee, gas, maxValue, onChangeAmount, setInputValue, title],
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
        store.isModalOpen = 'add-contact';
      } else {
        setConditionError(
          `Error: "${addressValue}" doesn't match ethereum address format`,
        );
      }
    }, [addressValue, setConditionError, store]);

    const handleUnlock = useCallback(async () => {
      store.hint = 'Follow the instructions in the pop up';
      setAccountUnlockingProcess(true);
      setLoading(true);
      const changePubkey = await zkWallet?.setSigningKey();
      store.hint = 'Confirmed! \n Waiting for transaction to be ended';
      const receipt = await changePubkey?.awaitReceipt();
      store.unlocked = !!receipt;
      setAccountUnlockingProcess(!receipt);
      setLoading(!receipt);
    }, [setAccountUnlockingProcess, setLoading, zkWallet]);

    const handleFilterContacts = useCallback(
      e => {
        if (!contacts) return;
        const searchValue = contacts.filter(el => {
          return ADDRESS_VALIDATION['eth'].test(e) &&
            el.address.toLowerCase().includes(e.toLowerCase())
            ? (setSelectedContact(el.name),
              handleSelect(el.name),
              (store.walletAddress = [el.name, el.address]),
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
        store,
      ],
    );

    const handleCancel = useCallback(() => {
      setTransactionType(undefined);
      setHash('');
      setExecuted(false);
      store.walletAddress = [];
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
      store,
    ]);

    useEffect(() => {
      if (
        title === 'Withdraw' &&
        zkWallet &&
        walletAddress.length < 2 &&
        !walletAddress[1] &&
        selectedContact !== null
      ) {
        store.walletAddress = ['Own account', zkWallet?.address()];
        onChangeAddress(zkWallet?.address());
      }
    }, []);

    const initWallet = async () => {
      store.searchBalances =
        title === 'Deposit' ? store.ethBalances : zkBalances;
    };

    useEffect(() => {
      cancelable(initWallet);
    }, [store.ethBalances]);

    useEffect(() => {
      cancelable(zkWallet?.getAccountState()).then((res: any) => {
        store.verified = res?.verified.balances;
        res?.id
          ? cancelable(zkWallet?.isSigningKeySet()).then(
              data => (store.unlocked = data),
            )
          : (store.unlocked = true);
      });
    }, [cancelable, store, zkWallet]);

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
      if (token && zkWallet && symbolName !== 'ETH') {
        zkWallet.isERC20DepositsApproved(token).then(res => setUnlockFau(res));
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
            store.walletAddress = [el.name, el.address];
            onChangeAddress(el.address);
          }
        });
      }

      if (unlockFau && isUnlockingProcess) {
        setUnlockFau(true);
        setUnlockingProcess(false);
        setLoading(false);
      }

      ethers
        .getDefaultProvider()
        .getGasPrice()
        .then(res => res.toString())
        .then(data => {
          setGas(data);
        });
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, [
      addressValue,
      balances,
      contacts,
      body,
      gas,
      filteredContacts,
      handleCancel,
      handleClickOutside,
      handleSelect,
      isBalancesListOpen,
      isContactsListOpen,
      isUnlockingProcess,
      isLoading,
      onChangeAddress,
      selected,
      selectedContact,
      setFilteredContacts,
      setLoading,
      setMaxValue,
      setSelected,
      setSelectedContact,
      setSymbol,
      setSymbolName,
      setToken,
      setUnlockFau,
      setUnlockingProcess,
      setWalletName,
      symbolName,
      title,
      token,
      unlocked,
      unlockFau,
      walletAddress,
      zkWallet,
      store,
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
      setUnlockingProcess(true);
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
        }
      };
      setUnlocked();
      if (!unlockFau) {
        setInterval(() => {
          setUnlocked();
        }, 3000);
      }
    }, [setLoading, token, unlockFau, zkWallet]);

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
      if (
        !ADDRESS_VALIDATION['eth'].test(addressValue) &&
        title !== 'Deposit'
      ) {
        setConditionError('Adress does not match ethereum address format');
      }
    }, [
      addressValue,
      inputValue,
      selectedBalance,
      setConditionError,
      unlockFau,
    ]);

    const handleFee = useCallback(
      e => {
        if (title !== 'Deposit') {
          zkWallet?.provider
            .getTransactionFee(
              title === 'Withdraw' ? 'Withdraw' : 'Transfer',
              (e * Math.pow(10, 18)).toString(),
              symbolName,
            )
            .then(res => setFee(res.toString()));
        }
      },
      [inputValue, symbolName, title, zkWallet],
    );

    const selectFilteredContact = (name, address) => {
      handleSelect(name);
      store.walletAddress = [name, address];
      onChangeAddress(address);
      openContactsList(false);
      setSelectedContact(name);
      setConditionError('');
      body?.classList.remove('fixed-b');
      setFilteredContacts([]);
    };

    const ContactList = ({ address, name }) => (
      <div
        className='balances-contact'
        key={name}
        onClick={() => {
          handleSelect(name);
          store.walletAddress = [name, address];
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
    );

    const BalancesList = ({ address, symbol, balance }) => (
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
              {symbol === 'ETH' && 'Ethereum'}
              {symbol === 'DAI' && 'Dai'}
              {symbol === 'FAU' && 'Faucet'}
            </span>
          </div>
        </div>
        <div className='balances-token-right'>
          <span>
            {window?.innerWidth > WIDTH_BP && 'balance:'}{' '}
            <p className='datalist-balance'>
              {+balance < 0.000001
                ? 0
                : parseFloat(balance.toFixed(8).toString())}
            </p>
          </span>
        </div>
      </div>
    );

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
              data={searchContacts}
              title='Select contact'
              header={() => (
                <>
                  <button
                    onClick={() => {
                      openContactsList(false);
                      body?.classList.remove('fixed-b');
                    }}
                    className='close-icon'
                  ></button>
                  <div className='assets-border-bottom'></div>
                </>
              )}
              visible={true}
              renderItem={contact => (
                <ContactList address={contact.address} name={contact.name} />
              )}
              emptyListComponent={() =>
                !searchContacts ? (
                  <p>{"You don't have contacts yet..."}</p>
                ) : null
              }
            />
          )}
          {isBalancesListOpen && (
            <DataList
              data={searchBalances}
              title='Token balances'
              header={() => (
                <button
                  onClick={() => {
                    openBalancesList(false);
                    body?.classList.remove('fixed-b');
                  }}
                  className='close-icon'
                ></button>
              )}
              visible={true}
              renderItem={({ address, symbol, balance }) => (
                <BalancesList
                  address={address}
                  symbol={symbol}
                  balance={balance}
                />
              )}
              emptyListComponent={() =>
                !searchBalances.length ? (
                  <p>
                    {
                      'No balances yet, please make a deposit or request money from someone!'
                    }
                  </p>
                ) : null
              }
            />
          )}
        </div>
        <div className='transaction-wrapper'>
          {unlocked === undefined && !isAccountUnlockingProcess && (
            <LockedTx handleCancel={handleCancel} handleUnlock={handleUnlock} />
          )}
          {isExecuted ? (
            <ExecutedTx
              addressValue={addressValue}
              hash={hash}
              handleCancel={handleCancel}
              inputValue={inputValue}
              setTransactionType={setTransactionType}
              symbolName={symbolName}
              title={title}
            />
          ) : unlocked === undefined || isLoading ? (
            <>
              {isLoading && (
                <LoadingTx
                  isAccountUnlockingProcess={isAccountUnlockingProcess}
                  isUnlockingProcess={isUnlockingProcess}
                  inputValue={inputValue}
                  symbolName={symbolName}
                  addressValue={addressValue}
                  handleCancel={handleCancel}
                  isLoading={isLoading}
                  setWalletName={setWalletName}
                  title={title}
                  unlockFau={unlockFau}
                />
              )}
              {hint.match(/(?:denied)/i) && (
                <CanceledTx
                  handleCancel={handleCancel}
                  setWalletName={setWalletName}
                />
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  handleCancel();
                  store.walletAddress = [];
                  setTransactionType(undefined);
                  history.push('/account');
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
                          <ContactSelectorFlat
                            body={body}
                            isContactsListOpen={isContactsListOpen}
                            openContactsList={openContactsList}
                            selectedContact={selectedContact}
                          />
                          <div className='currency-input-wrapper'>
                            {ADDRESS_VALIDATION['eth'].test(addressValue) && (
                              <img
                                src={makeBlockie(addressValue)}
                                alt='blockie-icon'
                                className='transaction-blockie'
                              />
                            )}
                            <input
                              placeholder='Ox address or contact name'
                              value={addressValue}
                              onChange={e => {
                                onChangeAddress(e.target.value);
                                handleFilterContacts(e.target.value);
                                store.walletAddress = [];
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
                                  store.walletAddress = [];
                                  setSelectedContact(null);
                                }}
                              ></button>
                            )}
                          </div>
                        </div>
                        {!!filteredContacts.length &&
                          addressValue &&
                          walletAddress.length < 2 && (
                            <FilteredContactList
                              filteredContacts={filteredContacts}
                              selectFilteredContact={selectFilteredContact}
                            />
                          )}
                      </>
                    )}
                    <>
                      <span className='transaction-field-title'>
                        {'Amount / asset'}
                      </span>
                      <div className='transaction-field balance'>
                        <div className='currency-input-wrapper border'>
                          <div className='scroll-wrapper'>
                            <input
                              placeholder={selectedBalance ? '0.00' : ''}
                              className='currency-input'
                              key='input1'
                              type='number'
                              ref={myRef}
                              onChange={e => {
                                validateNumbers(+e.target.value);
                                setAmount(+e.target.value);
                                handleInputWidth(+e.target.value);
                                setInputValue(e.target.value);
                                handleFee(+e.target.value);
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
                                  validateNumbers(maxValue);
                                  handleInputWidth(maxValue);
                                  handleFee(+maxValue);
                                  setAmount(+maxValue);
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
                    </>
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
                        {!!inputValue &&
                        selectedBalance &&
                        +inputValue > maxValue
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
                            {title === 'Deposit' &&
                              (+inputValue * 0.01 < 0.000001
                                ? 0
                                : +inputValue * 0.01)}
                            {title !== 'Deposit' &&
                              (+fee / Math.pow(10, 18) < 0.000001
                                ? 0
                                : +fee / Math.pow(10, 18))}
                          </>
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {zkBalancesLoaded && zkWallet && (
                      <>
                        <p>
                          {
                            'No balances yet, please make a deposit or request money from someone!'
                          }
                        </p>
                        <button
                          className='btn submit-button'
                          onClick={() => {
                            setTransactionType('deposit');
                            history.push('/deposit');
                          }}
                        >
                          {'Deposit'}
                        </button>
                      </>
                    )}
                    {(!zkBalancesLoaded || !zkWallet) && (
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
                )
              ) : (
                <>
                  {/* <div className='info-block center'>
                    <p>
                      {
                        'To control your account you need to unlock it once by registering your public key.'
                      }
                    </p>
                  </div>
                  <button className='btn submit-button' onClick={handleUnlock}>
                    <span className='submit-label unlock'></span>
                    {'Unlock'}
                  </button> */}
                </>
              )}
            </>
          )}
        </div>
      </>
    );
  },
);

export default Transaction;
