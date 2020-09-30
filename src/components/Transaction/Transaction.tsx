import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import makeBlockie from 'ethereum-blockies-base64';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AccountState, Tokens, TokenLike } from 'zksync/build/types';
import { Wallet, Provider, utils } from 'zksync';

import { useTimeout } from 'src/hooks/timers';
import { Transition } from 'components/Transition/Transition';

import { DataList } from 'components/DataList/DataListNew';
import { CheckBox } from 'src/components/Common/CheckBox';
import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import Spinner from 'components/Spinner/Spinner';
import { CanceledTx } from './CanceledTx';
import { ContactSelectorFlat } from './ContactSelectorFlat';
import { FilteredContactList } from './FilteredContactList';
import { ExecutedTx } from './ExecutedTx';
import { LoadingTx } from './LoadingTx';
import { LockedTx } from './LockedTx';
import { BackButton } from 'src/components/Common/BackButton';

import { ITransactionProps } from './Types';

import {
  handleFormatToken,
  handleExponentialNumbers,
  intervalAsyncStateUpdater,
  loadTokens,
  sortBalancesById,
  mintTestERC20Tokens,
  sortBalancesByBalance,
  addressMiddleCutter,
} from 'src/utils';
import {
  LINKS_CONFIG,
  FAUCET_TOKEN_API,
  ETH_MINT_ADDRESS,
  ABI_DEFAULT_INTERFACE,
} from 'src/config';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { INPUT_VALIDATION } from 'constants/regExs';
import { WIDTH_BP } from 'constants/magicNumbers';

import { useCancelable } from 'hooks/useCancelable';
import { useStore } from 'src/store/context';
import { useMobxEffect } from 'src/hooks/useMobxEffect';
import { useAutoFocus } from 'hooks/useAutoFocus';

import { DEFAULT_ERROR } from 'constants/errors';

import { IEthBalance } from '../../types/Common';

import './Transaction.scss';
import 'src/components/TokenInfo/TokenInfo.scss';

import SpinnerWorm from '../Spinner/SpinnerWorm';

library.add(fas);

interface ICopyBlockProps {
  children?: React.ReactNode;
  copyProp?: string;
  text?: string | number | undefined;
  classSpecifier?: string;
}

const CopyBlock: React.FC<ICopyBlockProps> = ({
  text,
  children,
  copyProp,
  classSpecifier,
}) => {
  const [copyOpened, setCopyOpened] = useState(false);
  useTimeout(() => copyOpened && setCopyOpened(false), 2000, [copyOpened]);
  const [copyRef, setCopyRef] = useState('');

  const handleCopy = useCallback(
    e => {
      navigator.clipboard.writeText(e);
      setCopyRef(e);
      setCopyOpened(true);
    },
    [copyRef, copyOpened],
  );

  const copyArg = copyProp || text;

  return (
    <div className='copy-block external'>
      <Transition type='fly' timeout={200} trigger={copyOpened}>
        <div className={'hint-copied open'}>
          <p>{'Copied!'}</p>
        </div>
      </Transition>

      {text && <p className={`copy-block-text ${classSpecifier}`}>{text}</p>}
      {children}
      <button
        onClick={() => {
          handleCopy(copyArg);
        }}
        className='copy-block-button btn-tr'
      ></button>
    </div>
  );
};

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

    const { ExternaWalletStore, TransactionStore } = store;

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
    const autoFocus = useAutoFocus();

    const [amount, setAmount] = useState<number>(0);
    const [conditionError, setConditionError] = useState('');
    const [gas, setGas] = useState<string>('');
    const [fee, setFee] = useState<any>();
    const [filteredContacts, setFilteredContacts] = useState<any>([]);
    const [isBalancesListOpen, openBalancesList] = useState<boolean>(false);
    const [isContactsListOpen, openContactsList] = useState<boolean>(false);
    const [isHintUnlocked, setHintUnlocked] = useState<string>('');
    const [isTwitExist, setTwitExist] = useState<string>('');
    const [isUnlockingProcess, setUnlockingERCProcess] = useState<boolean>(
      false,
    );
    const [isAccountUnlockingProcess, setAccountUnlockingProcess] = useState<
      boolean
    >(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [maxValue, setMaxValue] = useState<number>(
      store.propsMaxValue ? store.propsMaxValue : 0,
    );
    const [selected, setSelected] = useState<boolean>(false);
    const [selectedBalance, setSelectedBalance] = useState<any | undefined>();
    const [selectedContact, setSelectedContact] = useState<any | undefined>();
    const [symbolName, setSymbolName] = useState<string>(
      store.propsSymbolName ? store.propsSymbolName : '',
    );
    const [token, setToken] = useState<string>(
      store.propsToken ? store.propsToken : '',
    );
    const [unlockFau, setUnlockFau] = useState<boolean>(false);
    const [value, setValue] = useState<string>(
      window.localStorage?.getItem('walletName') || '',
    );

    const [refreshTimer, setRefreshTimer] = useState<number | null>(null);

    const history = useHistory();

    useEffect(() => {
      const arr = window.localStorage?.getItem(
        `contacts${store.zkWallet?.address()}`,
      );
      if (arr) {
        store.searchContacts = JSON.parse(arr);
      }
    }, [store.zkWallet]);

    useEffect(() => {
      if (store.zkWallet?.ethSignerType?.verificationMethod === 'ERC-1271') {
        store.EIP1271Signature = true;
      } else {
        store.EIP1271Signature = false;
      }
    }, [store.zkWallet]);

    const handleUnlock = useCallback(
      async (withLoading: boolean) => {
        try {
          store.txButtonUnlocked = false;
          if (!store.isBurnerWallet) {
            store.hint = 'Follow the instructions in the pop up';
          }
          if (withLoading === true) {
            setAccountUnlockingProcess(true);
            setLoading(true);
          }
          let changePubkey;
          const isOnchainAuthSigningKeySet = await zkWallet?.isOnchainAuthSigningKeySet();
          const isSigningKeySet = await zkWallet?.isSigningKeySet();
          if (
            store.zkWallet?.ethSignerType?.verificationMethod === 'ERC-1271'
          ) {
            if (!isOnchainAuthSigningKeySet) {
              const onchainAuthTransaction = await zkWallet?.onchainAuthSigningKey();
              await onchainAuthTransaction?.wait();
              changePubkey = await zkWallet?.setSigningKey('committed', true);
            }
            if (!!isOnchainAuthSigningKeySet && !isSigningKeySet) {
              changePubkey = await zkWallet?.setSigningKey('committed', true);
            }
          } else {
            if (!isOnchainAuthSigningKeySet) {
              changePubkey = await zkWallet?.setSigningKey();
            }
          }
          store.hint = 'Confirmed! \n Waiting for transaction to be mined';
          const receipt = await changePubkey?.awaitReceipt();

          store.unlocked = !!receipt;
          if (!!receipt) {
            store.txButtonUnlocked = true;
          }
          setAccountUnlockingProcess(!receipt);
          setLoading(!receipt);
        } catch (err) {
          store.error = `${err.name}: ${err.message}`;
          store.txButtonUnlocked = true;
        }
      },
      [setAccountUnlockingProcess, setLoading, zkWallet, store.unlocked],
    );

    useEffect(() => {
      if (
        store.isBurnerWallet &&
        !store.unlocked &&
        zkWallet &&
        title !== 'Deposit'
      ) {
        cancelable(zkWallet?.getAccountState())
          .then((res: any) => res)
          .then(() => {
            cancelable(zkWallet?.isSigningKeySet()).then(data =>
              data ? null : handleUnlock(true),
            );
          });
      }
    }, [store.unlocked, store.walletName]);

    const getAccState = async () => {
      if (zkWallet && tokens) {
        const _accountState = await zkWallet.getAccountState();
        if (JSON.stringify(accountState) !== JSON.stringify(_accountState)) {
          store.accountState = _accountState;
        }
        const at = _accountState.depositing.balances;
        store.awaitedTokens = at;
        const zkBalance = _accountState.committed.balances;
        const zkBalancePromises = Object.keys(zkBalance).map(async key => {
          return {
            address: tokens[key].address,
            balance: +handleFormatToken(
              zkWallet,
              tokens[key].symbol,
              zkBalance[key] ? +zkBalance[key] : 0,
            ),
            symbol: tokens[key].symbol,
          };
        });
        Promise.all(zkBalancePromises)
          .then(res => {
            const _balances = res.sort(sortBalancesByBalance);
            if (
              JSON.stringify(_balances) !== JSON.stringify(store.zkBalances)
            ) {
              store.zkBalances = _balances;
              store.zkBalancesLoaded = true;
            }
          })
          .catch(err => {
            err.name && err.message
              ? (store.error = `${err.name}: ${err.message}`)
              : (store.error = DEFAULT_ERROR);
          });
      }

      if (
        JSON.stringify(accountState?.verified.balances) !==
        JSON.stringify(store.verified)
      ) {
        store.verified = accountState?.verified.balances;
      }
    };

    const loadEthTokens = useCallback(async () => {
      const { tokens } = await loadTokens(
        syncProvider as Provider,
        syncWallet as Wallet,
        accountState as AccountState,
      );

      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol && syncWallet) {
          const balance = await syncWallet.getEthereumBalance(key);
          return {
            id: tokens[key].id,
            address: tokens[key].address,
            balance: +handleFormatToken(
              syncWallet,
              tokens[key].symbol,
              +balance ? +balance : 0,
            ),
            symbol: tokens[key].symbol,
          };
        }
      });

      await Promise.all(balancePromises)
        .then(res => {
          const _balances = res
            .filter(token => token && token.balance > 0)
            .sort(sortBalancesById);
          const _balancesEmpty = res
            .filter(token => token?.balance === 0)
            .sort(sortBalancesById);
          _balances.push(..._balancesEmpty);
          if (JSON.stringify(_balances) !== JSON.stringify(store.ethBalances)) {
            store.ethBalances = _balances as IEthBalance[];
          }
        })
        .catch(err => {
          err.name && err.message
            ? (store.error = `${err.name}: ${err.message}`)
            : (store.error = DEFAULT_ERROR);
        });
    }, [
      accountState,
      store.error,
      store.ethBalances,
      syncWallet,
      syncProvider,
    ]);

    useEffect(() => {
      if (!store.zkWallet || !store.tokens) return;
      if (title === 'Deposit') {
        intervalAsyncStateUpdater(loadEthTokens, [], 3000, cancelable);
      } else {
        intervalAsyncStateUpdater(getAccState, [], 3000, cancelable);
      }
    }, [store.zkWallet, store.tokens]);

    useEffect(() => {
      if (!store.zkWallet || !store.tokens) return;
      if (title === 'Deposit') {
        loadEthTokens();
      } else {
        getAccState();
      }
    }, [store.zkWallet, store.tokens]);

    const submitCondition =
      (ADDRESS_VALIDATION['eth'].test(addressValue) ||
        (title === 'Deposit' &&
          (unlockFau ||
            store.tokenInUnlockingProgress.includes(token) ||
            !!store.EIP1271Signature))) &&
      !conditionError.length &&
      selectedBalance &&
      inputValue &&
      !!store.txButtonUnlocked &&
      +inputValue > 0 &&
      +inputValue <= maxValue;

    useEffect(() => {
      if (
        addressValue.length > 0 &&
        !ADDRESS_VALIDATION['eth'].test(addressValue)
      ) {
        setConditionError(
          `Error: "${addressValue}" doesn't match ethereum address format`,
        );
      } else {
        setConditionError('');
      }
    }, [addressValue]);

    const feeBasedOntype = store.fastWithdrawal ? store.fastFee : fee;

    const validateNumbers = useCallback(
      (e, max?: boolean) => {
        const maxBigValue =
          symbolName &&
          store.zkWallet?.provider.tokenSet.parseToken(
            symbolName,
            handleExponentialNumbers(maxValue).toString(),
          );
        if (e.length === 0) {
          setInputValue(e);
        }
        if (INPUT_VALIDATION.digits.test(e)) {
          if (symbolName) {
            try {
              store.zkWallet?.provider.tokenSet.parseToken(symbolName, e);
              setInputValue(handleExponentialNumbers(e));
            } catch {
              return;
            }
          }
        } else {
          return;
        }
        const amountBigNumber =
          max && maxBigValue && store.zkWallet
            ? +maxBigValue - (feeBasedOntype ? +feeBasedOntype : 0)
            : symbolName &&
              store.zkWallet?.provider.tokenSet.parseToken(
                symbolName,
                e.toString(),
              );

        if (maxBigValue && amountBigNumber && feeBasedOntype) {
        }
        if (
          store.zkWallet &&
          feeBasedOntype &&
          maxBigValue &&
          amountBigNumber &&
          +maxBigValue - +feeBasedOntype === +amountBigNumber
        ) {
          const formattedFee = handleFormatToken(
            store.zkWallet,
            symbolName,
            feeBasedOntype,
          );
          if (+e - +formattedFee > 0) {
            setInputValue((+e - +formattedFee).toString());
          } else {
            setConditionError(
              'Not enough funds: amount + fee exceeds your balance',
            );
          }
        }
        const estimateGas =
          store.zkWallet &&
          +store.zkWallet?.provider.tokenSet.parseToken('ETH', '0.0002');
        const _eb = store.ethBalances.filter(b => b.symbol === 'ETH')[0]
          ?.balance
          ? store.ethBalances
              .filter(b => b.symbol === 'ETH')[0]
              .balance.toString()
          : '0';
        const ethBalance = store.zkWallet?.provider.tokenSet.parseToken(
          'ETH',
          _eb,
        );
        if (
          amountBigNumber &&
          maxBigValue &&
          ((title === 'Deposit' &&
            estimateGas &&
            ((ethBalance && +ethBalance < +estimateGas) ||
              +amountBigNumber > +maxBigValue)) ||
            (title !== 'Deposit' &&
              feeBasedOntype &&
              (+amountBigNumber + +feeBasedOntype > +maxBigValue ||
                +amountBigNumber < 0)))
        ) {
          setConditionError(
            'Not enough funds: amount + fee exceeds your balance',
          );
        } else {
          setConditionError('');
        }
        if (
          title === 'Deposit' &&
          ethBalance &&
          amountBigNumber &&
          maxBigValue &&
          estimateGas &&
          (+ethBalance < +estimateGas ||
            (symbolName === 'ETH' && +maxBigValue < +amountBigNumber))
        ) {
          setConditionError(
            'Not enough ETH to perform a transaction on mainnet',
          );
        }
        if (INPUT_VALIDATION.digits.test(e) && amountBigNumber && maxBigValue) {
          title === 'Deposit'
            ? onChangeAmount(
                +amountBigNumber + +gas > +maxBigValue
                  ? +amountBigNumber
                  : +amountBigNumber,
              )
            : onChangeAmount(
                +amountBigNumber + +feeBasedOntype >= +maxBigValue
                  ? +amountBigNumber
                  : +amountBigNumber,
              );
        }
      },
      [
        fee,
        gas,
        store.fastFee,
        feeBasedOntype,
        store.fastWithdrawal,
        symbolName,
        store.ethBalances,
        store.zkWallet,
        maxValue,
        onChangeAmount,
        setInputValue,
        title,
      ],
    );

    const setWalletName = useCallback(() => {
      if (value && value !== ethId) {
        window.localStorage?.setItem('walletName', value);
      } else {
        setValue(window.localStorage?.getItem('walletName') || ethId);
      }
    }, [ethId, value]);

    const handleFee = useCallback(
      (e?, symbol?, address?) => {
        const symbolProp = symbol ? symbol : symbolName;
        const addressProp = address ? address : addressValue;
        if (!store.zkWallet || !symbolProp || !addressProp) return;
        if (
          title !== 'Deposit' &&
          (symbol || symbolName) &&
          ADDRESS_VALIDATION['eth'].test(address ? address : addressValue)
        ) {
          store.zkWallet?.provider
            .getTransactionFee(
              title === 'Withdraw' ? 'Withdraw' : 'Transfer',
              addressProp,
              symbolProp,
            )
            .then(res => setFee(res.totalFee));
        }
        if (title === 'Withdraw') {
          store.zkWallet?.provider
            .getTransactionFee('FastWithdraw', addressProp, symbolProp)
            .then(res => (store.fastFee = res.totalFee));
        }
      },
      [
        symbolName,
        selectedContact,
        title,
        zkWallet,
        token,
        selectedBalance,
        token,
        addressValue,
      ],
    );

    const handleSelect = useCallback(
      name => {
        if (isContactsListOpen) {
          setSelectedContact(name);
          handleFee();
        }
        if (isBalancesListOpen) {
          setSelectedBalance(name);
          handleFee();
        }
      },
      [
        isBalancesListOpen,
        isContactsListOpen,
        onChangeAddress,
        handleFee,
        inputValue,
      ],
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
        store.modalSpecifier = 'add-contact';
        store.isContact = false;
      } else {
        setConditionError(
          `Error: "${addressValue}" doesn't match ethereum address format`,
        );
      }
    }, [addressValue, setConditionError, store]);

    const handleFilterContacts = useCallback(
      e => {
        if (!searchContacts) return;
        const searchValue = searchContacts.filter(({ name, address }) => {
          return ADDRESS_VALIDATION['eth'].test(e) &&
            address.toLowerCase().includes(e.toLowerCase())
            ? (setSelectedContact(name),
              handleSelect(name),
              handleFee(undefined, undefined, address),
              (store.walletAddress = { name, address }),
              onChangeAddress(address))
            : name.toLowerCase().includes(e.toLowerCase());
        });
        if (searchValue.length === 0) {
          handleSelect('');
          store.walletAddress = {};
          setSelectedContact('');
        }
        setFilteredContacts(searchValue);
      },
      [
        addressValue,
        searchContacts,
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
      store.walletAddress = {};
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
      if (title === 'Withdraw' && store.zkWallet && selectedContact !== null) {
        store.walletAddress = {
          name: 'Own account',
          address: store.zkWallet?.address(),
        };
        handleFee(undefined, undefined, store.zkWallet?.address());
        onChangeAddress(store.zkWallet?.address());
      }
    }, [zkWallet]);

    useEffect(() => {
      setExecuted(false);
    }, [zkWallet, setExecuted]);

    useEffect(() => {
      return () => {
        store.propsMaxValue = null;
        store.propsSymbolName = null;
        store.propsToken = null;
      };
    }, []);

    useMobxEffect(() => {
      store.searchBalances =
        title === 'Deposit' ? store.ethBalances : zkBalances;
      cancelable(zkWallet?.getAccountState())
        .then((res: any) => {
          store.verified = res?.verified.balances;
        })
        .then(() => {
          cancelable(zkWallet?.isSigningKeySet()).then(
            data => (store.unlocked = data),
          );
        });
    }, [
      cancelable,
      store,
      zkWallet,
      store.searchBalances,
      title,
      store.unlocked,
    ]);

    const handleManageUnlockingTokens = () => {
      const _inUnlocking = store.tokenInUnlockingProgress;
      const _index = _inUnlocking.indexOf(token);
      if (_index >= 0) {
        _inUnlocking.splice(_index, 1);
        store.tokenInUnlockingProgress = _inUnlocking;
      }
    };

    const handleUpdateTokenPrice = async symbol => {
      if (!store.price) return;
      const tokenPrice = await store.syncProvider?.getTokenPrice(symbol);
      store.price[symbol] = tokenPrice as number;
    };

    useEffect(() => {
      if (!!symbolName) {
        handleUpdateTokenPrice(symbolName);
      }
    }, []);

    useEffect(() => {
      if (balances?.length === 1) {
        setToken(
          !!balances[0].address || balances[0].symbol === 'ETH'
            ? balances[0].address
            : balances[0].symbol,
        );
        setMaxValue(balances[0].balance);
        handleUpdateTokenPrice(balances[0].symbol);
        setSelectedBalance(balances[0].symbol);
        setSymbolName(balances[0].symbol);
        setSymbol(balances[0].symbol);
        handleFee(undefined, balances[0].symbol, addressValue);
      }
    }, [title, selectedContact, selectedBalance]);

    useMobxEffect(() => {
      if ((token && token === 'ETH') || symbolName === 'ETH') {
        setUnlockFau(true);
      }

      if (
        token &&
        zkWallet &&
        symbolName !== 'ETH' &&
        !store.isExternalWallet
      ) {
        zkWallet.isERC20DepositsApproved(token).then(res => {
          setUnlockFau(res);
          if (res === true) {
            handleManageUnlockingTokens();
          }
        });
      }
      if (store.propsToken) {
        setSymbol(store.propsToken);
        setSelectedBalance(store.propsToken);
        setSelected(true);
      }
      if (
        ADDRESS_VALIDATION['eth'].test(addressValue) &&
        !selectedContact &&
        title !== 'Withdraw'
      ) {
        searchContacts?.filter(el => {
          if (el.address.toLowerCase().includes(addressValue.toLowerCase())) {
            setSelectedContact(el.name);
            handleSelect(el.name);
            store.walletAddress = { name: el.name, address: el.address };
            onChangeAddress(el.address);
            handleFee(undefined, undefined, el.address);
          }
        });
      }

      if (unlockFau && isUnlockingProcess) {
        setUnlockFau(true);
        handleManageUnlockingTokens();
        setUnlockingERCProcess(false);
        setLoading(false);
      }
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, [
      addressValue,
      balances,
      searchContacts,
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
      setUnlockingERCProcess,
      setWalletName,
      symbolName,
      title,
      token,
      unlocked,
      unlockFau,
      walletAddress,
      zkWallet,
      store,
      store.propsToken,
      store.tokenInUnlockingProgress,
    ]);

    useEffect(() => {
      if (!store.zkWallet) return;
      ethers
        .getDefaultProvider(LINKS_CONFIG.network)
        .getGasPrice()
        .then(res => res.toString())
        .then(data => {
          setGas(data);
        });
    }, [isBalancesListOpen, store.zkWallet]);

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
      setUnlockingERCProcess(true);
      setLoading(true);
      if (!store.isBurnerWallet) {
        store.hint = 'Follow the instructions in the pop up';
      }
      zkWallet
        ?.approveERC20TokenDeposits(token)
        .then(res => {
          setLoading(false);
          setUnlockingERCProcess(false);
          store.tokenInUnlockingProgress = store.tokenInUnlockingProgress.concat(
            [token],
          );
          store.hint = `Waiting for transaction to be mined\n \n ${res.hash}`;
          return res;
        })
        .then(data => {
          return data;
        })
        .catch(err => {
          if (!!`${err}`.match(/insufficient/)) {
            store.error = 'Insufficient ETH founds';
          }
          setLoading(false);
          setUnlockingERCProcess(false);
        });
      const setUnlocked = async () => {
        const checkApprove = await zkWallet
          ?.isERC20DepositsApproved(token)
          .then(res => res);
        if (checkApprove) {
          handleManageUnlockingTokens();
          setUnlockFau(checkApprove);
          setUnlockingERCProcess(false);
        }
      };
      setUnlocked();
      if (!unlockFau && store.tokenInUnlockingProgress.includes(token)) {
        setInterval(() => {
          setUnlocked();
        }, 1000);
      }
    }, [
      setLoading,
      token,
      unlockFau,
      zkWallet,
      store.tokenInUnlockingProgress,
    ]);

    useEffect(() => {
      if (symbolName === 'MLTT' && title === 'Withdraw') {
        const twitExist = async () => {
          const res = await fetch(
            `${FAUCET_TOKEN_API}/is_withdraw_allowed/${store.zkWallet?.address()}`,
          );
          setTwitExist(await res.text());
        };
        if (isTwitExist === 'false') {
          store.modalHintMessage = 'makeTwitToWithdraw';
          store.modalSpecifier = 'modal-hint';
        } else {
          return;
        }
      }
    }, [symbolName, title, isBalancesListOpen, isTwitExist]);

    const handleInputWidth = useCallback(
      e => {
        const el = myRef.current;
        if (el) {
          el.style.minWidth =
            (window?.innerWidth > WIDTH_BP ? 260 : 120) + 'px';
          el.style.width =
            (e === maxValue && e.toString() !== '0'
              ? e.toString().length
              : el.value.length + 1) + 'ch';
        }
      },
      [inputValue, maxValue],
    );

    const handleSumbit = useCallback(() => {
      if (submitCondition) {
        if (
          symbolName === 'MLTT' &&
          title === 'Withdraw' &&
          LINKS_CONFIG.networkId === '1'
        ) {
          store.modalHintMessage = 'MLTTBlockModal';
          store.modalSpecifier = 'modal-hint';
          // const getTwitted = localStorage.getItem(
          //   `twittMade${store.zkWallet?.address()}`,
          // );
          // if (!getTwitted) {
          //   store.modalHintMessage = 'makeTwitToWithdraw';
          //   store.modalSpecifier = 'modal-hint';
          // } else {
          //   transactionAction(token, type, symbolName);
          // }
          // const twitExist = async () => {
          //   const res = await fetch(
          //     `https://${
          //       LINKS_CONFIG.network
          //     }-faucet.zksync.dev/is_withdraw_allowed/${store.zkWallet?.address()}`,
          //   );
          //   return await res.text().then(data => {
          //     if (data === 'false') {
          //       store.modalHintMessage = 'makeTwitToWithdraw';
          //       store.modalSpecifier = 'modal-hint';
          //     } else {
          //       transactionAction(token, type, symbolName);
          //     }
          //   });
          // };
          // twitExist();
        } else {
          store.txButtonUnlocked = false;
          transactionAction(token, type, symbolName);
        }
      }
      if (!selectedBalance || (inputValue && +inputValue <= 0) || !inputValue) {
        setConditionError(
          `Please select the token and set the ${title.toLowerCase()} amount`,
        );
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
      submitCondition,
      isTwitExist,
      store.zkWallet,
      symbolName,
      title,
    ]);

    const selectFilteredContact = (name, address) => {
      handleSelect(name);
      store.walletAddress = { name, address };
      onChangeAddress(address);
      handleFee(undefined, undefined, address), openContactsList(false);
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
          store.walletAddress = { name, address };
          onChangeAddress(address);
          handleFee(undefined, undefined, address), openContactsList(false);
          setConditionError('');
          setSelected(true);
          body?.classList.remove('fixed-b');
          setFilteredContacts([]);
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

    async function getBalanceOnContract(
      ethSigner: ethers.Signer,
      zksyncProvider: Provider,
      token: TokenLike,
    ) {
      const tokenId = zksyncProvider.tokenSet.resolveTokenId(token);
      const ABI = [
        {
          constant: true,
          inputs: [
            {
              internalType: 'address',
              name: '_address',
              type: 'address',
            },
            {
              internalType: 'uint16',
              name: '_tokenId',
              type: 'uint16',
            },
          ],
          name: 'getBalanceToWithdraw',
          outputs: [
            {
              internalType: 'uint128',
              name: '',
              type: 'uint128',
            },
          ],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ];
      if (ethSigner.provider) {
        const zksContract = new ethers.Contract(
          zksyncProvider.contractAddress.mainContract,
          ABI,
          ethSigner.provider,
        );
        const contractBalance = await zksContract.getBalanceToWithdraw(
          await ethSigner.getAddress(),
          tokenId,
        );
        return contractBalance;
      }
    }

    useEffect(() => {
      if (
        !store.zkWallet ||
        !ExternaWalletStore.externalWalletEthersSigner ||
        !store.tokens
      )
        return;

      const storeContractBalances = () => {
        const obj: any = {};
        Promise.all(
          Object.keys(store.tokens as Tokens).map(key => {
            return getBalanceOnContract(
              store.zkWallet?.ethSigner as ethers.Signer,
              store.zkWallet?.provider as Provider,
              key,
            ).then(res => {
              if (+res > 0) {
                obj[key] = +res;
              }
            });
          }),
        ).then(() => {
          if (
            JSON.stringify(
              ExternaWalletStore.externalWalletContractBalances,
            ) !== JSON.stringify(obj)
          ) {
            ExternaWalletStore.externalWalletContractBalances = obj;
          }
          ExternaWalletStore.externalWalletContractBalancesLoaded = true;
        });
      };

      intervalAsyncStateUpdater(storeContractBalances, [], 10000, cancelable);
    }, [
      store.zkWallet,
      ExternaWalletStore.externalWalletEthersSigner,
      store.tokens,
    ]);

    useEffect(() => {
      if (!store.zkWallet) return;
    }, [ExternaWalletStore.externalWalletContractBalances, store.zkWallet]);

    const mainContract = store.zkWallet?.provider.contractAddress.mainContract;
    const etherscanContracLink = `//${LINKS_CONFIG.ethBlockExplorer}/address/${mainContract}#writeProxyContract`;

    const ExternalWalletBalance = ({ balance, symbol }) => (
      <div className='external-wallet-wrapper'>
        <div>
          {symbol} {balance}
        </div>
        {balance && (
          <button
            onClick={() => {
              store.modalSpecifier = 'external-wallet-instructions 1';
              setSymbolName(symbol);
              setToken(
                store.zkWallet?.provider.tokenSet.resolveTokenAddress(
                  symbol,
                ) as string,
              );
              setMaxValue(balance);
            }}
            className='undo-btn'
          >
            {'Start withdrawal'}
          </button>
        )}
        {ExternaWalletStore.externalWalletContractBalances[symbol] &&
          store.zkWallet && (
            <button
              onClick={() => {
                store.modalSpecifier = 'external-wallet-instructions 2';
                setSymbolName(symbol);
                setToken(
                  store.zkWallet?.provider.tokenSet.resolveTokenAddress(
                    symbol,
                  ) as string,
                );
                setMaxValue(
                  ExternaWalletStore.externalWalletContractBalances[symbol],
                );
              }}
              className='undo-btn'
            >{`Complete withdraw of ${handleFormatToken(
              store.zkWallet,
              symbol,
              ExternaWalletStore.externalWalletContractBalances[symbol],
            )} ${symbol}`}</button>
          )}
      </div>
    );

    const DefaultWalletBalance = ({ symbol, balance }) => (
      <>
        <div className='balances-token-left'>
          <div className='balances-token-name'>
            <p>{symbol}</p>
          </div>
        </div>
        <div className='balances-token-right'>
          <span>
            {window?.innerWidth > WIDTH_BP && 'balance:'}
            <p className='datalist-balance'>
              {handleExponentialNumbers(balance)}
            </p>
          </span>
          {title === 'Deposit' && LINKS_CONFIG.network !== 'mainnet' && (
            <button
              onClick={e => {
                e.stopPropagation();
                if (!store.isBurnerWallet)
                  store.hint = 'Follow the instructions in the pop up';
                store.modalSpecifier = 'sign-metamask';
                symbol === 'ETH'
                  ? window.open(ETH_MINT_ADDRESS)
                  : mintTestERC20Tokens(
                      zkWallet as Wallet,
                      symbol as TokenLike,
                      store,
                    );
              }}
              className='undo-btn'
            >
              {symbol === 'ETH' ? (
                <>
                  {'Get some Rinkeby ETH '}
                  <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
                </>
              ) : (
                'Click to mint some tokens'
              )}
            </button>
          )}
          {store.isExternalWallet && (
            <span>
              {window?.innerWidth > WIDTH_BP && 'contract balance:'}
              <p className='datalist-balance'>
                {ExternaWalletStore.externalWalletContractBalance}
              </p>
            </span>
          )}
        </div>
      </>
    );

    const BalancesList = ({ address, symbol, balance }) => (
      <div
        onClick={() => {
          if (store.isExternalWallet) {
            return;
          }
          if (address === 'awaited') {
            return;
          } else {
            handleUpdateTokenPrice(symbol);
            setToken(address);
            setMaxValue(balance);
            setSymbolName(symbol);
            setSymbol(symbol);
            handleSelect(symbol);
            openBalancesList(false);
            setSelected(true);
            setConditionError('');
            handleInputWidth(1);
            validateNumbers('');
            TransactionStore.pureAmountInputValue = '';
            handleFee(inputValue, symbol);
            body?.classList.remove('fixed-b');
          }
        }}
        key={address}
        className={`balances-token ${store.isExternalWallet && 'external'}`}
      >
        {store.isExternalWallet ? (
          <ExternalWalletBalance balance={balance} symbol={symbol} />
        ) : (
          <DefaultWalletBalance balance={balance} symbol={symbol} />
        )}
      </div>
    );

    const checkForContractWithoutZk = () => {
      const zkBalanceKeys = store.zkBalances.map(el => el.symbol);
      return Object.keys(
        ExternaWalletStore.externalWalletContractBalances,
      ).filter(key => !zkBalanceKeys.includes(key));
    };

    const burnerWalletAccountUnlockCondition =
      store.isBurnerWallet && !store.unlocked && title !== 'Deposit';

    const calculateMaxValue = () => {
      if (store.zkWallet) {
        return handleExponentialNumbers(maxValue).toString();
      }
    };

    interface ICopyBlockProps {
      children?: React.ReactNode;
      copyProp?: string;
      text?: string | number | undefined;
      classSpecifier?: string;
    }

    useEffect(() => {
      store.txButtonUnlocked = true;
    }, [store.zkWallet, selectedBalance]);

    const MLTTFeePrice = symbolName === 'MLTT' ? 1 : 0;

    const timeCalc = (timeInSec: number) => {
      const hours = Math.floor(timeInSec / 60 / 60);
      const minutes = Math.floor(timeInSec / 60) - hours * 60;
      const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      };
    };

    const fastWithdrawalTime = timeCalc(store.fastWithdrawalProcessingTime);
    const withdrawalTime = timeCalc(store.withdrawalProcessingTime);

    const handleTimeAmount = (time, string) =>
      `${time} ${string}${time > 1 ? 's' : ''}`;

    const timeStempString = ({ hours, minutes, seconds }) => {
      return `${hours ? handleTimeAmount(hours, 'hour') : ''} ${
        minutes ? handleTimeAmount(minutes, 'minute') : ''
      } ${seconds ? handleTimeAmount(seconds, 'second') : ''}`;
    };

    useEffect(() => {
      if (!store.zkWallet) return;
      fetch(ABI_DEFAULT_INTERFACE)
        .then(res => res.text())
        .then(data => (store.abiText = data));
    }, [store.zkWallet]);

    const WithdrawTypeBlock = observer(() => {
      if (!store.zkWallet) return null;
      const showFeeCondition: boolean =
        symbolName &&
        feeBasedOntype &&
        ADDRESS_VALIDATION['eth'].test(addressValue);

      const exceedBalanceTrigger = feeArg => {
        return (
          +inputValue +
            +handleFormatToken(store.zkWallet as Wallet, symbolName, +feeArg) >=
          +maxValue
        );
      };

      const valueHandler = () => {
        const maxValueInSelected =
          +TransactionStore.pureAmountInputValue +
            +handleFormatToken(store.zkWallet as Wallet, symbolName, fee) >=
          +maxValue;

        if (store.fastWithdrawal && !!maxValueInSelected) {
          return (
            +TransactionStore.pureAmountInputValue -
            +handleFormatToken(
              store.zkWallet as Wallet,
              symbolName,
              +store.fastFee,
            )
          );
        }
        if (!store.fastWithdrawal && !!maxValueInSelected) {
          return (
            +TransactionStore.pureAmountInputValue -
            +handleFormatToken(store.zkWallet as Wallet, symbolName, +fee)
          );
        } else {
          return +TransactionStore.pureAmountInputValue;
        }
      };

      const checkboxCb = fee => {
        store.fastWithdrawal = !store.fastWithdrawal;
        if (!inputValue) return;
        if (exceedBalanceTrigger(fee)) {
          return setConditionError(
            'Not enough funds: amount + fee exceeds your balance',
          );
        }
        validateNumbers(valueHandler()?.toString());
        setAmount(valueHandler() as number);
        handleInputWidth(valueHandler() as number);
        setConditionError('');
        TransactionStore.pureAmountInputValue = valueHandler()?.toString();
      };

      return (
        <>
          {!!showFeeCondition && store.zkWallet && (
            <div
              className='withdraw-type-block'
              onClick={() => {
                checkboxCb(fee);
              }}
            >
              <CheckBox checked={!store.fastWithdrawal} />
              <p className='checkbox-text'>{`Normal (fee ${fee &&
                handleFormatToken(
                  store.zkWallet,
                  symbolName,
                  +fee,
                )} ${symbolName}), processing time ${timeStempString(
                withdrawalTime,
              )}`}</p>
            </div>
          )}
          {!!showFeeCondition && store.zkWallet && (
            <div
              className='withdraw-type-block'
              onClick={() => {
                checkboxCb(store.fastFee);
              }}
            >
              <CheckBox checked={store.fastWithdrawal} />
              <p className='checkbox-text'>{`Fast (fee ${+store.fastFee &&
                handleFormatToken(
                  store.zkWallet,
                  symbolName,
                  +store.fastFee,
                )} ${symbolName}), processing time ${timeStempString(
                fastWithdrawalTime,
              )}`}</p>
            </div>
          )}
        </>
      );
    });

    return (
      <>
        <Modal
          visible={false}
          classSpecifier='sign-metamask'
          background={false}
          centered={true}
          cancelAction={() => {
            store.withCloseMintModal = false;
            store.modalSpecifier = '';
            store.hint = '';
          }}
        >
          <h2 className='transaction-title'>{'Minting token'}</h2>
          {!store.isBurnerWallet && <p>{store.hint}</p>}
          <Spinner />
          <button
            onClick={() => (store.modalSpecifier = '')}
            className='btn btn-cancel btn-tr '
          >
            {'Close'}
          </button>
        </Modal>
        <Modal
          visible={false}
          classSpecifier='add-contact'
          clickOutside={false}
          background={true}
          centered
        >
          <SaveContacts
            title='Add contact'
            addressValue={addressValue}
            addressInput={false}
          />
        </Modal>
        <Modal
          visible={false}
          classSpecifier='external-wallet-instructions 1'
          clickOutside={false}
          background={true}
          centered
        >
          <div className='scroll-content'>
            <h2 className='transaction-title'>{`Start withdrawing ${symbolName}`}</h2>
            <h3>
              {'Amount to withdraw: '}
              {maxValue}
            </h3>
            <p>
              {
                'At the moment, we only support withdrawals to L1 for external wallets.'
              }
            </p>
            <p>{`A withdrawal is performed in 2 steps. First, a FullExit transaction must initiated from your account (${addressMiddleCutter(
              store.zkWallet?.address() as string,
              6,
              4,
            )}) — the details are provided below.`}</p>
            <p>
              {
                'After the transaction is mined, the token balance will disappear from the list until the next rollup block is verified (maximum 3 hours). Once this happens, the balance will re-appear in this UI with a button to complete your withdrawal.'
              }
            </p>
            <div className='grey-block'>
              <h3>{'Contract:'}</h3>
              <p className='external-argument'>{'Address'}</p>
              <CopyBlock copyProp={mainContract}>
                <a target='_blank' href={etherscanContracLink}>
                  {mainContract}
                </a>
              </CopyBlock>
              <p className='external-argument'>{'ABI'}</p>
              <CopyBlock
                text={`${store.abiText?.substring(0, 40)}...`}
                copyProp={store.abiText}
              />
              <h3>{'Method:'}</h3>
              <CopyBlock text={'fullExit'} />
              <h3>{'Arguments:'}</h3>
              <p className='external-argument'>{'_accountId (uint32)'}</p>
              <CopyBlock text={store.accountState?.id} />
              <p className='external-argument'>{'_token (address)'}</p>
              <CopyBlock text={token} />
            </div>
          </div>
        </Modal>
        <Modal
          visible={false}
          classSpecifier='external-wallet-instructions 2'
          clickOutside={false}
          background={true}
          centered
        >
          <div className='scroll-content'>
            <h2 className='transaction-title'>{`Complete withdrawal ${symbolName}`}</h2>
            <div className='grey-block'>
              <h3>{'Contract:'}</h3>
              <p className='external-argument'>{'Address'}</p>
              <CopyBlock copyProp={mainContract}>
                <a target='_blank' href={etherscanContracLink}>
                  {mainContract}
                </a>
              </CopyBlock>
              <p className='external-argument'>{'ABI'}</p>
              <CopyBlock
                text={`${store.abiText?.substring(0, 40)}...`}
                copyProp={store.abiText}
              />
              <h3>{'Method:'}</h3>
              <CopyBlock
                text={symbolName === 'ETH' ? 'withdrawETH' : 'withdrawERC20'}
              />
              <h3>{'Arguments:'}</h3>
              {symbolName !== 'ETH' && (
                <>
                  <p className='external-argument'>{'_token (address)'}</p>
                  <CopyBlock text={token} />
                </>
              )}
              <p className='external-argument'>{'_amount (uint128)'}</p>
              <CopyBlock
                text={
                  ExternaWalletStore.externalWalletContractBalances[symbolName]
                }
              />
            </div>
          </div>
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
                !searchContacts ? <p>{'The contact list is empty'}</p> : null
              }
            />
          )}
          {isBalancesListOpen && (
            <DataList
              data={title === 'Deposit' ? store.ethBalances : store.zkBalances}
              title={`Balances in ${title === 'Deposit' ? 'L1' : 'L2'}`}
              footer={() => (
                <div className='hint-datalist-wrapper'>
                  <button
                    onClick={() => {
                      if (store.isExternalWallet) {
                        openBalancesList(false);
                        store.modalSpecifier = 'external-wallet-instructions';
                      } else {
                        store.modalHintMessage = 'TroubleSeeingAToken';
                        store.modalSpecifier = 'modal-hint';
                      }
                    }}
                    className='undo-btn large'
                  >
                    {store.isExternalWallet && !store.isAccountBalanceNotEmpty
                      ? 'Open withdrawal guide'
                      : 'Can’t find a token?'}
                  </button>
                </div>
              )}
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
                !store.isAccountBalanceNotEmpty ? (
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
          {store.unlocked === false &&
            store.unlocked !== undefined &&
            !isAccountUnlockingProcess &&
            title !== 'Deposit' &&
            zkBalancesLoaded &&
            (!!store.isAccountBalanceNotEmpty || store.isExternalWallet) &&
            !store.isBurnerWallet &&
            (!store.isExternalWallet ? (
              <LockedTx
                handleCancel={handleCancel}
                handleUnlock={() => handleUnlock(true)}
              />
            ) : (
              <>
                <DataList
                  data={
                    title === 'Deposit' ? store.ethBalances : store.zkBalances
                  }
                  title={`Balances in ${title === 'Deposit' ? 'L1' : 'L2'}`}
                  visible={true}
                  classSpecifier='external'
                  renderItem={({ address, symbol, balance }) => (
                    <>
                      {ExternaWalletStore.externalWalletContractBalancesLoaded ? (
                        <BalancesList
                          address={address}
                          symbol={symbol}
                          balance={balance}
                        />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                  emptyListComponent={() =>
                    !store.isAccountBalanceNotEmpty ? (
                      <p>
                        {
                          'No balances yet, please make a deposit or request money from someone!'
                        }
                      </p>
                    ) : null
                  }
                />
                {ExternaWalletStore.externalWalletContractBalancesLoaded ? (
                  <>
                    {checkForContractWithoutZk().map(key => (
                      <div className='balances-token external' key={key}>
                        <ExternalWalletBalance
                          balance={
                            ExternaWalletStore.externalWalletContractBalances
                              .key
                          }
                          symbol={key}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <Spinner />
                )}
              </>
            ))}
          {isExecuted && (
            <ExecutedTx
              fee={
                title === 'Transfer' &&
                feeBasedOntype &&
                store.zkWallet &&
                handleFormatToken(store.zkWallet, symbolName, +feeBasedOntype)
              }
              price={
                +(price && !!price[selectedBalance]
                  ? price[selectedBalance]
                  : 0)
              }
              addressValue={addressValue}
              hash={hash}
              handleCancel={handleCancel}
              inputValue={inputValue}
              setTransactionType={setTransactionType}
              symbolName={symbolName}
              title={title}
            />
          )}
          {((!isExecuted &&
            (store.unlocked === undefined || isLoading || !zkBalancesLoaded)) ||
            burnerWalletAccountUnlockCondition) && (
            <>
              {store.isExternalWallet ? (
                <DataList
                  data={store.zkBalances}
                  title={'Balances in L2'}
                  visible={true}
                  classSpecifier='external'
                  renderItem={({ address, symbol, balance }) => (
                    <>
                      {ExternaWalletStore.externalWalletContractBalancesLoaded ? (
                        <BalancesList
                          address={address}
                          symbol={symbol}
                          balance={balance}
                        />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                  emptyListComponent={() =>
                    !store.isAccountBalanceNotEmpty ? <Spinner /> : null
                  }
                />
              ) : (
                <>
                  <LoadingTx
                    fee={
                      title === 'Transfer' &&
                      fee &&
                      store.zkWallet &&
                      handleFormatToken(store.zkWallet, symbolName, +fee)
                    }
                    price={
                      +(price && !!price[selectedBalance]
                        ? price[selectedBalance]
                        : 0)
                    }
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
                    setLoading={setLoading}
                    setAccountUnlockingProcess={setAccountUnlockingProcess}
                    setUnlockingERCProcess={setUnlockingERCProcess}
                  />

                  {hint.match(/(?:denied)/i) && !isLoading && (
                    <CanceledTx
                      handleCancel={handleCancel}
                      setWalletName={setWalletName}
                    />
                  )}
                </>
              )}
            </>
          )}
          {zkWallet &&
            zkBalancesLoaded &&
            !isLoading &&
            !isExecuted &&
            unlocked !== undefined &&
            (unlocked || title === 'Deposit') &&
            !burnerWalletAccountUnlockCondition && (
              <>
                <BackButton
                  cb={() => {
                    handleCancel();
                    store.walletAddress = {};
                    setTransactionType(undefined);
                    store.txButtonUnlocked = true;
                    history.goBack();
                  }}
                />
                <h2 className='transaction-title'>{title}</h2>

                {(unlocked || title === 'Deposit') &&
                unlocked !== undefined &&
                ((title === 'Deposit' && zkBalancesLoaded) ||
                  (title !== 'Deposit' && store.isAccountBalanceNotEmpty)) ? (
                  <>
                    <div className={`inputs-wrapper ${title}`}>
                      {isInput && (
                        <div>
                          <span className='transaction-field-title plain'>
                            {'To address: '}
                            {title === 'Transfer' && (
                              <button
                                onClick={() => {
                                  store.modalHintMessage =
                                    'DoNoTSendToExchanges';
                                  store.modalSpecifier = 'modal-hint';
                                }}
                                className='hint-question-mark marginless'
                              >
                                {'?'}
                              </button>
                            )}
                          </span>
                          <div
                            onClick={() => {
                              if (!selectedContact) {
                                const el = document.getElementById(
                                  'addressInput',
                                );
                                el?.focus();
                              }
                            }}
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
                                id='addressInput'
                                onChange={e => {
                                  onChangeAddress(e.target.value);
                                  handleFilterContacts(e.target.value);
                                  store.walletAddress = {};
                                  handleFee(
                                    undefined,
                                    undefined,
                                    e.target.value,
                                  );
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
                                !walletAddress.name && (
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
                                    walletAddress.address &&
                                    addressValue === walletAddress.address
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
                                      walletAddress.address &&
                                      addressValue === walletAddress.address
                                        ? ''
                                        : 'short'
                                    }`}
                                  >
                                    {(selectedContact || !walletAddress.name) &&
                                    walletAddress.address &&
                                    addressValue === walletAddress.address ? (
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
                                    store.walletAddress = {};
                                    setSelectedContact(null);
                                    setFee(undefined);
                                  }}
                                ></button>
                              )}
                            </div>
                          </div>
                          {!!filteredContacts.length && addressValue && (
                            <FilteredContactList
                              filteredContacts={filteredContacts}
                              selectFilteredContact={selectFilteredContact}
                            />
                          )}
                        </div>
                      )}
                      <div>
                        <span className='transaction-field-title plain'>
                          {'Amount / asset'}
                        </span>
                        <div className='transaction-field balance'>
                          <div className='currency-input-wrapper border'>
                            <div className='scroll-wrapper'>
                              <input
                                placeholder={selectedBalance ? '0.00' : ''}
                                className='currency-input'
                                key='input1'
                                type='text'
                                ref={myRef}
                                autoFocus={title === 'Transfer' ? true : false}
                                onChange={e => {
                                  if (!symbolName) return;
                                  validateNumbers(e.target.value);
                                  setAmount(+e.target.value);
                                  handleInputWidth(+e.target.value);
                                  TransactionStore.pureAmountInputValue =
                                    e.target.value;
                                }}
                                value={
                                  inputValue
                                    ? // ? handleExponentialNumbers(+inputValue.toString().replace(/-/g, ''))
                                      inputValue.toString().replace(/-/g, '')
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
                                  {selectedBalance && (
                                    <span>
                                      {'~$'}
                                      {
                                        +(
                                          +(price && !!price[selectedBalance]
                                            ? price[selectedBalance]
                                            : 0) *
                                          (inputValue
                                            ? Math.abs(+inputValue)
                                            : 0)
                                        ).toFixed(2)
                                      }
                                    </span>
                                  )}
                                </div>
                                {(feeBasedOntype || title === 'Deposit') && (
                                  <button
                                    className='all-balance btn-tr'
                                    onClick={() => {
                                      if (store.zkWallet) {
                                        validateNumbers(
                                          maxValue.toString(),
                                          true,
                                        );
                                        handleInputWidth(calculateMaxValue());
                                        handleFee(calculateMaxValue());
                                        setAmount(
                                          parseFloat(
                                            calculateMaxValue() as string,
                                          ),
                                        );
                                        TransactionStore.pureAmountInputValue = calculateMaxValue().toString();
                                      }
                                    }}
                                  >
                                    {selectedBalance &&
                                      ((feeBasedOntype &&
                                        ADDRESS_VALIDATION['eth'].test(
                                          addressValue,
                                        )) ||
                                        title === 'Deposit') && (
                                        <>
                                          {'Max:'}
                                          {handleExponentialNumbers(
                                            maxValue,
                                          )}{' '}
                                        </>
                                      )}
                                    {symbolName &&
                                    selectedBalance &&
                                    ((feeBasedOntype &&
                                      ADDRESS_VALIDATION['eth'].test(
                                        addressValue,
                                      )) ||
                                      title === 'Deposit')
                                      ? symbolName
                                      : ''}
                                  </button>
                                )}
                                {!feeBasedOntype &&
                                  !!selectedBalance &&
                                  title !== 'Deposit' && (
                                    <p className='all-balance-empty'>
                                      {'Max:'}
                                      {handleExponentialNumbers(maxValue)}{' '}
                                      {symbolName}
                                    </p>
                                  )}
                              </div>
                            ) : (
                              <div
                                className='currency-input-wrapper'
                                key={token}
                              >
                                <span>{'You have no balances'}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    {title === 'Withdraw' && <WithdrawTypeBlock />}
                    <div className={`hint-unlocked ${!!isHintUnlocked}`}>
                      {isHintUnlocked}
                    </div>
                    {title === 'Deposit' &&
                      token !== 'ETH' &&
                      selectedBalance &&
                      !store.EIP1271Signature && (
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
                                    : balances?.length && balances[0].symbol}
                                  {' token unlocked'}
                                </p>
                              ) : (
                                <p>
                                  {`${
                                    store.tokenInUnlockingProgress.includes(
                                      token,
                                    )
                                      ? 'Unlocking'
                                      : 'Unlock'
                                  } `}
                                  {symbolName.length
                                    ? symbolName
                                    : balances?.length && balances[0].symbol}
                                  {' token'}
                                </p>
                              )}
                              <button
                                onClick={() => {
                                  store.modalHintMessage = 'ERC20UnlockHint';
                                  store.modalSpecifier = 'modal-hint';
                                }}
                                className='hint-question-mark'
                              >
                                {'?'}
                              </button>
                            </div>
                            {store.tokenInUnlockingProgress.includes(token) ? (
                              <SpinnerWorm />
                            ) : (
                              <button
                                onClick={() =>
                                  !unlockFau
                                    ? handleUnlockERC()
                                    : ((store.modalHintMessage =
                                        'ERC20UnlockHintUnlocked'),
                                      (store.modalSpecifier = 'modal-hint'))
                                }
                                className={`fau-unlock-tocken ${unlockFau}`}
                              >
                                <span
                                  className={`fau-unlock-tocken-circle ${unlockFau}`}
                                ></span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    <div className='error-container'>
                      <p
                        className={`error-text ${
                          (!!inputValue &&
                            ADDRESS_VALIDATION['eth'].test(addressValue) &&
                            selectedBalance &&
                            +inputValue >= maxValue) ||
                          !!conditionError
                            ? 'visible'
                            : ''
                        }`}
                      >
                        {!!inputValue &&
                        selectedBalance &&
                        title !== 'Deposit' &&
                        +inputValue > maxValue
                          ? 'Not enough funds: amount + fee exceeds your balance'
                          : conditionError}
                      </p>
                    </div>
                    {!!store.txButtonUnlocked ? (
                      <button
                        className={`btn submit-button ${
                          (!unlockFau &&
                            !store.EIP1271Signature &&
                            !store.tokenInUnlockingProgress.includes(token) &&
                            title === 'Deposit') ||
                          !inputValue ||
                          (!!inputValue && +inputValue > maxValue) ||
                          !submitCondition
                            ? 'disabled'
                            : ''
                        }`}
                        onClick={handleSumbit}
                      >
                        {title !== 'Deposit' &&
                          title !== 'Withdraw' &&
                          title !== 'Transfer' && (
                            <span
                              className={`submit-label ${title} ${
                                submitCondition ? true : false
                              }`}
                            ></span>
                          )}

                        {title}
                      </button>
                    ) : (
                      <Spinner />
                    )}

                    {title === 'Withdraw' && (
                      <p className='withdraw-hint'>
                        {`Your withdrawal should take max. ${timeStempString(
                          store.fastWithdrawal
                            ? fastWithdrawalTime
                            : withdrawalTime,
                        )}.`}
                      </p>
                    )}
                    <div className='transaction-fee-wrapper'>
                      <p key={maxValue} className='transaction-fee'>
                        {!!selectedBalance &&
                          feeBasedOntype &&
                          ADDRESS_VALIDATION['eth'].test(addressValue) &&
                          title !== 'Deposit' && (
                            <>
                              {'Fee: '}
                              {store.zkWallet &&
                                symbolName &&
                                feeBasedOntype &&
                                ADDRESS_VALIDATION['eth'].test(addressValue) &&
                                handleFormatToken(
                                  store.zkWallet,
                                  symbolName,
                                  +feeBasedOntype,
                                )}
                              {store.zkWallet && feeBasedOntype && (
                                <span>
                                  {' ~$'}
                                  {
                                    +(
                                      +(price && !!price[selectedBalance]
                                        ? price[selectedBalance]
                                        : MLTTFeePrice) *
                                      +handleFormatToken(
                                        store.zkWallet,
                                        symbolName,
                                        +feeBasedOntype,
                                      )
                                    ).toFixed(2)
                                  }
                                </span>
                              )}
                            </>
                          )}
                      </p>
                    </div>
                  </>
                ) : null}
              </>
            )}
          {!isAccountUnlockingProcess &&
            !isExecuted &&
            !store.isAccountBalanceNotEmpty &&
            title !== 'Deposit' &&
            store.zkBalancesLoaded &&
            store.zkWallet && (
              <>
                {!unlocked && (
                  <>
                    <BackButton
                      cb={() => {
                        handleCancel();
                        store.walletAddress = {};
                        setTransactionType(undefined);
                        store.txButtonUnlocked = true;
                        history.goBack();
                      }}
                    />
                    {!store.isExternalWallet && (
                      <h2 className='transaction-title'>{title}</h2>
                    )}
                  </>
                )}
                {!store.isExternalWallet && (
                  <>
                    <p>
                      {
                        'No balances yet, please make a deposit or request money from someone!'
                      }
                    </p>
                    <button
                      className='btn submit-button'
                      onClick={() => {
                        store.transactionType = 'deposit';
                        history.push('/deposit');
                      }}
                    >
                      {'Deposit'}
                    </button>
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
