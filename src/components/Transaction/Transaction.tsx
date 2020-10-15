import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import makeBlockie from 'ethereum-blockies-base64';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AccountState, Tokens, TokenLike } from 'zksync/build/types';
import { Wallet, Provider } from 'zksync';

import { DataList } from 'components/DataList/DataListNew';
import { RadioButton } from 'src/components/Common/RadioButton';
import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import Spinner from 'components/Spinner/Spinner';
import { CanceledTx } from './CanceledTx';
import { ContactSelectorFlat } from './ContactSelectorFlat';
import { FilteredContactList } from './FilteredContactList';
import { ExecutedTx } from './ExecutedTx';
import { LoadingTx } from './LoadingTx';
import { LockedTxNew as LockedTx } from './LockedTx';
import {
  AmountToWithdraw,
  CompleteWithdrawal,
} from './ExternalWalletComponents';
import {
  handleUnlockNew as handleUnlock,
  getAccState,
} from './TransactionFunctions';
import { BackButton } from 'src/components/Common/BackButton';

import { ITransactionProps } from './Types';

import {
  addressMiddleCutter,
  handleFormatToken,
  handleExponentialNumbers,
  intervalAsyncStateUpdater,
  loadTokens,
  sortBalancesById,
  mintTestERC20Tokens,
  useCallbackWrapper,
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

import { DEFAULT_ERROR } from 'constants/errors';

import { IEthBalance } from '../../types/Common';

import './Transaction.scss';
import 'src/components/TokenInfo/TokenInfo.scss';

import SpinnerWorm from '../Spinner/SpinnerWorm';

library.add(fas);

const Transaction: React.FC<ITransactionProps> = observer(
  ({
    addressValue,
    balances,
    hash,
    isExecuted,
    isInput,
    onChangeAddress,
    price,
    setHash,
    setExecuted,
    setTransactionType,
    setSymbol,
    title,
    transactionAction,
    type,
  }): JSX.Element => {
    const store = useStore();

    const { ExternaWalletStore, TransactionStore, AccountStore } = store;

    const {
      ethId,
      hint,
      searchContacts,
      unlocked,
      walletAddress,
      zkBalances,
      zkBalancesLoaded,
      zkWallet,
    } = store;

    const cancelable = useCancelable();

    const body = document.querySelector('#body');
    const myRef = useRef<HTMLInputElement>(null);

    const [amount, setAmount] = useState<number>(0);
    const [isHintUnlocked, setHintUnlocked] = useState<string>('');
    const [isTwitExist, setTwitExist] = useState<string>('');
    const [isUnlockingProcess, setUnlockingERCProcess] = useState<boolean>(
      false,
    );
    const [inputValue, setInputValue] = useState<string>('');
    const [selected, setSelected] = useState<boolean>(false);
    const [selectedBalance, setSelectedBalance] = useState<any | undefined>();
    const [selectedContact, setSelectedContact] = useState<any | undefined>();
    const [unlockFau, setUnlockFau] = useState<boolean>(false);
    const [value, setValue] = useState<string>(
      window.localStorage?.getItem('walletName') || '',
    );

    const history = useHistory();

    useEffect(() => {
      if (!store.zkWallet) {
        setSelectedBalance('');
        setUnlockFau(false);
      }
    }, [store.zkWallet]);

    useEffect(() => {
      TransactionStore.transferFeeToken = '';
    }, [store.zkWallet]);

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

    useEffect(() => {
      if (!store.zkWallet) return;
      const checkForOnChain = async () => {
        AccountStore.isOnchainAuthSigningKeySet = await zkWallet?.isOnchainAuthSigningKeySet();
      };
      checkForOnChain();
    }, [store.zkWallet]);

    const handleUnlockWithUseCallBack = useCallbackWrapper(
      handleUnlock,
      [store, true],
      [
        AccountStore.isAccountUnlockingProcess,
        store.zkWallet,
        store.unlocked,
        TransactionStore.isLoading,
      ],
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
              data ? null : handleUnlockWithUseCallBack(),
            );
          });
      }
    }, [store.unlocked, store.walletName]);

    const loadEthTokens = useCallback(async () => {
      if (!store.zkWallet || !store.syncProvider || !store.accountState) return;
      const { tokens } = await loadTokens(
        store.syncProvider as Provider,
        store.zkWallet as Wallet,
        store.accountState as AccountState,
      );
      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol && store.zkWallet) {
          const balance = await store.zkWallet.getEthereumBalance(key);
          return {
            id: tokens[key].id,
            address: tokens[key].address,
            balance: +handleFormatToken(
              store.zkWallet,
              tokens[key].symbol,
              balance ? balance : 0,
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
      store.accountState,
      store.error,
      store.ethBalances,
      store.syncWallet,
      store.syncProvider,
      store.zkWallet,
    ]);

    useEffect(() => {
      if (!store.zkWallet || !store.tokens) return;
      if (title === 'Deposit') {
        intervalAsyncStateUpdater(loadEthTokens, [], 3000, cancelable);
      } else {
        intervalAsyncStateUpdater(getAccState, [store], 3000, cancelable);
      }
    }, [store.zkWallet, store.tokens]);

    useEffect(() => {
      if (!store.zkWallet || !store.tokens) return;
      if (title === 'Deposit') {
        loadEthTokens();
      } else {
        getAccState(store);
      }
    }, [store.zkWallet, store.tokens]);

    const submitCondition =
      (ADDRESS_VALIDATION['eth'].test(addressValue) ||
        (title === 'Deposit' &&
          (unlockFau ||
            store.tokenInUnlockingProgress.includes(
              TransactionStore.tokenAddress,
            ) ||
            !!store.EIP1271Signature))) &&
      !TransactionStore.conditionError.length &&
      selectedBalance &&
      inputValue &&
      !!store.txButtonUnlocked &&
      +inputValue > 0 &&
      +inputValue <= TransactionStore.maxValue;

    useEffect(() => {
      if (
        addressValue.length > 0 &&
        !ADDRESS_VALIDATION['eth'].test(addressValue)
      ) {
        TransactionStore.conditionError = `Error: "${addressMiddleCutter(
          addressValue,
          6,
          6,
        )}" doesn't match ethereum address format`;
      } else {
        TransactionStore.conditionError = '';
      }
    }, [addressValue]);

    const feeToken = TransactionStore.transferFeeToken
      ? TransactionStore.transferFeeToken
      : TransactionStore.symbolName;

    const feeBasedOntype = store.fastWithdrawal
      ? TransactionStore.fastFee
      : TransactionStore.fee[feeToken];

    const validateNumbers = useCallback(
      (e, max?: boolean) => {
        const maxBigValue =
          TransactionStore.symbolName &&
          store.zkWallet?.provider.tokenSet.parseToken(
            TransactionStore.symbolName,
            handleExponentialNumbers(TransactionStore.maxValue).toString(),
          );
        if (e.length === 0) {
          setInputValue(e);
        }
        if (INPUT_VALIDATION.digits.test(e)) {
          if (TransactionStore.symbolName) {
            try {
              store.zkWallet?.provider.tokenSet.parseToken(
                TransactionStore.symbolName,
                e,
              );
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
            : TransactionStore.symbolName &&
              store.zkWallet?.provider.tokenSet.parseToken(
                TransactionStore.symbolName,
                e.toString(),
              );

        if (
          store.zkWallet &&
          feeBasedOntype &&
          maxBigValue &&
          amountBigNumber &&
          +maxBigValue - +feeBasedOntype === +amountBigNumber
        ) {
          const formattedFee = handleFormatToken(
            store.zkWallet,
            feeToken,
            feeBasedOntype,
          );
          if (+e - +formattedFee > 0) {
            if (max) {
              if (title !== 'Transfer') {
                setInputValue((+e - +formattedFee).toString());
                TransactionStore.amountValue = +e - +formattedFee;
              }
              if (
                title === 'Transfer' &&
                TransactionStore.symbolName ===
                  TransactionStore.transferFeeToken
              ) {
                setInputValue((+e - +formattedFee).toString());
                TransactionStore.amountValue = +e - +formattedFee;
              }
              if (
                title === 'Transfer' &&
                TransactionStore.symbolName !==
                  TransactionStore.transferFeeToken
              ) {
                setInputValue(e);
                TransactionStore.amountValue = +e;
              }
            } else {
              TransactionStore.conditionError =
                'Not enough funds: amount + fee exceeds your balance';
            }
          } else {
            TransactionStore.conditionError =
              'Not enough funds: amount + fee exceeds your balance';
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
          title !== 'Transfer' &&
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
          TransactionStore.conditionError =
            'Not enough funds: amount + fee exceeds your balance';
        } else if (title === 'Transfer' && store.zkWallet) {
          const formattedFee = handleFormatToken(
            store.zkWallet,
            feeToken,
            feeBasedOntype,
          );
          const feeTokenBalance = store.zkBalances?.filter(
            balance => feeToken === balance.symbol,
          );
          if (
            TransactionStore.symbolName === TransactionStore.transferFeeToken &&
            +TransactionStore.amountValue + +formattedFee >
              +TransactionStore.maxValue
          ) {
            TransactionStore.conditionError =
              'Not enough funds: amount + fee exceeds your balance';
          } else if (
            TransactionStore.symbolName !== TransactionStore.transferFeeToken &&
            +formattedFee > +feeTokenBalance[0].balance
          ) {
            TransactionStore.conditionError =
              'Not enough funds: amount + fee exceeds your balance';
          } else {
            TransactionStore.conditionError = '';
          }
        } else {
          TransactionStore.conditionError = '';
        }
        if (
          title === 'Deposit' &&
          ethBalance &&
          amountBigNumber &&
          maxBigValue &&
          estimateGas &&
          (+ethBalance < +estimateGas ||
            (TransactionStore.symbolName === 'ETH' &&
              +maxBigValue < +amountBigNumber))
        ) {
          TransactionStore.conditionError =
            'Not enough ETH to perform a transaction on mainnet';
        }
        if (
          INPUT_VALIDATION.digits.test(e) &&
          TransactionStore.maxValue &&
          TransactionStore.amountValue
        ) {
          if (!store.zkWallet) return;
          if (title === 'Deposit') {
            const formattedGas = handleFormatToken(
              store.zkWallet,
              TransactionStore.symbolName,
              TransactionStore.gas,
            );

            if (TransactionStore.symbolName === 'ETH') {
              const amount =
                TransactionStore.amountValue + +formattedGas >=
                TransactionStore.maxValue
                  ? TransactionStore.amountValue - +formattedGas
                  : TransactionStore.amountValue;
              TransactionStore.amountBigValue = store.zkWallet.provider.tokenSet.parseToken(
                TransactionStore.symbolName,
                amount.toString(),
              );
            } else {
              const amount = TransactionStore.amountValue;
              TransactionStore.amountBigValue = store.zkWallet.provider.tokenSet.parseToken(
                TransactionStore.symbolName,
                amount.toString(),
              );
            }
          } else {
            const formattedFee = handleFormatToken(
              store.zkWallet,
              feeToken,
              feeBasedOntype,
            );
            const amount =
              TransactionStore.amountValue + +formattedFee >=
              TransactionStore.maxValue
                ? TransactionStore.amountValue - +formattedFee
                : TransactionStore.amountValue;
            TransactionStore.amountBigValue = store.zkWallet.provider.tokenSet.parseToken(
              TransactionStore.symbolName,
              amount.toString(),
            );
          }
        }
      },
      [
        TransactionStore.fee,
        TransactionStore.gas,
        TransactionStore.amountValue,
        TransactionStore.amountBigValue,
        TransactionStore.fastFee,
        feeBasedOntype,
        store.fastWithdrawal,
        TransactionStore.symbolName,
        store.ethBalances,
        store.zkWallet,
        TransactionStore.maxValue,
        setInputValue,
        TransactionStore.conditionError,
        title,
        inputValue,
      ],
    );

    const setWalletName = useCallback(() => {
      if (value && value !== ethId) {
        window.localStorage?.setItem('walletName', value);
      } else {
        setValue(window.localStorage?.getItem('walletName') || ethId);
      }
    }, [ethId, value]);

    const feeType = {
      ChangePubKey: {
        onchainPubkeyAuth: AccountStore.isOnchainAuthSigningKeySet as boolean,
      },
    };

    const getChangePubKeyFees = useCallback(() => {
      if (
        !store.zkWallet ||
        !store.zkBalancesLoaded ||
        AccountStore.isOnchainAuthSigningKeySet === undefined
      )
        return;

      const obj: any = {};
      Promise.all(
        store.zkBalances.map(balance => {
          const symbol = balance.symbol;
          return store.zkWallet?.provider
            .getTransactionFee(feeType, store.zkWallet?.address(), symbol)
            .then(res => {
              obj[symbol] = res.totalFee;
            });
        }),
      ).then(() => {
        TransactionStore.changePubKeyFees = obj;
      });
    }, [
      store.zkWallet,
      store.zkBalancesLoaded,
      AccountStore.isOnchainAuthSigningKeySet,
      feeType,
      store.zkBalances,
      TransactionStore.changePubKeyFees,
    ]);

    useEffect(() => {
      getChangePubKeyFees();
    }, [
      store.zkWallet,
      store.zkBalancesLoaded,
      store.zkBalances,
      AccountStore.isOnchainAuthSigningKeySet,
    ]);

    const handleTransferFee = useCallback(
      async (symbol, address?) => {
        if (title !== 'Transfer') return;
        const batchFee = await store.zkWallet?.provider.getTransactionsBatchFee(
          ['Transfer', 'Transfer'],
          [address ? address : addressValue, store.zkWallet?.address()],
          symbol,
        );
        TransactionStore.fee[symbol] = batchFee;
      },
      [addressValue, store.zkWallet],
    );

    useEffect(() => {
      if (
        !store.zkWallet ||
        !store.zkBalancesLoaded ||
        !TransactionStore.transferFeeToken ||
        title !== 'Transfer'
      )
        return;
      const feeBalance = store.zkBalances?.filter(
        balance => balance.symbol === TransactionStore.transferFeeToken,
      );
      const formattedFee =
        TransactionStore.fee[TransactionStore.transferFeeToken] &&
        +handleFormatToken(
          store.zkWallet,
          TransactionStore.transferFeeToken,
          TransactionStore.fee[TransactionStore.transferFeeToken],
        );

      if (feeBalance[0].balance < formattedFee) {
        TransactionStore.conditionError =
          'Not enough funds: amount + fee exceeds your balance';
      }
    }, [
      store.zkWallet,
      store.zkBalancesLoaded,
      title,
      TransactionStore.transferFeeToken,
      TransactionStore.fee[TransactionStore.transferFeeToken],
      store.zkBalances,
    ]);

    const handleFee = useCallback(
      (e?, symbol?, address?) => {
        const symbolProp = symbol ? symbol : TransactionStore.symbolName;
        const addressProp = address ? address : addressValue;
        if (
          !store.zkWallet ||
          !symbolProp ||
          !addressProp ||
          title === 'Transfer'
        )
          return;
        if (
          title !== 'Deposit' &&
          (symbol || TransactionStore.symbolName) &&
          ADDRESS_VALIDATION['eth'].test(address ? address : addressValue)
        ) {
          store.zkWallet?.provider
            .getTransactionFee(
              title === 'Withdraw' ? 'Withdraw' : 'Transfer',
              addressProp,
              symbolProp,
            )
            .then(res => (TransactionStore.fee[symbolProp] = res.totalFee));
        }
        if (title === 'Withdraw') {
          store.zkWallet?.provider
            .getTransactionFee('FastWithdraw', addressProp, symbolProp)
            .then(res => (TransactionStore.fastFee = res.totalFee));
        }

        if (!store.unlocked) {
          store.zkWallet?.provider
            .getTransactionFee(feeType, store.zkWallet?.address(), symbolProp)
            .then(res => (TransactionStore.changePubKeyFee = +res.totalFee));
        }
      },
      [
        TransactionStore.symbolName,
        selectedContact,
        title,
        zkWallet,
        TransactionStore.tokenAddress,
        selectedBalance,
        addressValue,
        store.unlocked,
        AccountStore.isOnchainAuthSigningKeySet,
      ],
    );

    useEffect(() => {
      if (title !== 'Withdraw') return;
      handleFee(undefined, undefined, store.zkWallet?.address());
    }, [
      store.unlocked,
      TransactionStore.isBalancesListOpen,
      AccountStore.isOnchainAuthSigningKeySet,
    ]);

    const handleSelect = useCallback(
      name => {
        if (TransactionStore.isContactsListOpen) {
          setSelectedContact(name);
          handleFee();
        }
        if (TransactionStore.isBalancesListOpen) {
          setSelectedBalance(name);
          handleFee();
          handleTransferFee(name);
        }
      },
      [
        TransactionStore.isBalancesListOpen,
        TransactionStore.isContactsListOpen,
        onChangeAddress,
        handleFee,
        inputValue,
      ],
    );

    const handleClickOutside = useCallback(
      e => {
        if (e.target.getAttribute('data-name')) {
          e.stopPropagation();
          TransactionStore.isContactsListOpen = false;
          TransactionStore.isBalancesListOpen = false;
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
        TransactionStore.conditionError = `Error: "${addressMiddleCutter(
          addressValue,
          6,
          6,
        )}" doesn't match ethereum address format`;
      }
    }, [addressValue, TransactionStore.conditionError, store]);

    const handleFilterContacts = useCallback(
      e => {
        if (!searchContacts) return;
        const searchValue = searchContacts.filter(({ name, address }) => {
          return ADDRESS_VALIDATION['eth'].test(e) &&
            address.toLowerCase().includes(e.toLowerCase())
            ? (setSelectedContact(name),
              handleSelect(name),
              handleFee(undefined, undefined, address),
              handleTransferFee(feeToken),
              (store.walletAddress = { name, address }),
              onChangeAddress(address))
            : name.toLowerCase().includes(e.toLowerCase());
        });
        if (searchValue.length === 0) {
          handleSelect('');
          store.walletAddress = {};
          setSelectedContact('');
        }
        TransactionStore.filteredContacts = searchValue;
      },
      [
        addressValue,
        searchContacts,
        handleSelect,
        onChangeAddress,
        TransactionStore.filteredContacts,
        setSelectedContact,
        store,
        TransactionStore.symbolName,
        feeToken,
      ],
    );

    const handleCancel = useCallback(() => {
      setTransactionType(undefined);
      setHash('');
      setExecuted(false);
      store.walletAddress = {};
      TransactionStore.isLoading = false;
      setSelectedBalance('');
      setSelectedContact('');
      onChangeAddress('');
      handleFilterContacts('');
    }, [
      handleFilterContacts,
      onChangeAddress,
      setExecuted,
      setHash,
      setSelectedBalance,
      setSelectedContact,
      setTransactionType,
      store,
      TransactionStore.isLoading,
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
        .then((res: any) => res)
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
      const _index = _inUnlocking.indexOf(TransactionStore.tokenAddress);
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
      if (!!TransactionStore.symbolName) {
        handleUpdateTokenPrice(TransactionStore.symbolName);
      }
    }, []);

    const autoSelectBalance = (balances, id) => {
      if (!balances?.length) return;
      TransactionStore.tokenAddress =
        !!balances[id].address || balances[id].symbol === 'ETH'
          ? balances[id].address
          : balances[id].symbol;
      TransactionStore.maxValue = balances[id].balance;
      handleUpdateTokenPrice(balances[id].symbol);
      setSelectedBalance(balances[id].symbol);
      TransactionStore.symbolName = balances[id].symbol;
      setSymbol(balances[id].symbol);
      if (!store.unlocked) return;
      handleFee(undefined, balances[id].symbol, addressValue);
      handleTransferFee(balances[id].symbol);
    };

    const autoSelectBalanceForUnlock = useCallback(() => {
      TransactionStore.symbolName = '';
      for (let i = 0; i < store.zkBalances.length; i++) {
        const formattedFee =
          store.zkWallet &&
          store.zkBalances &&
          TransactionStore.changePubKeyFees[store.zkBalances[i].symbol] &&
          handleFormatToken(
            store.zkWallet,
            store.zkBalances[i].symbol,
            TransactionStore.changePubKeyFees[store.zkBalances[i].symbol],
          );
        const lastBalanceId = store.zkBalances.length - 1;
        if (!formattedFee) return;

        if (
          !TransactionStore.symbolName &&
          store.zkBalances[i].balance > +formattedFee
        ) {
          autoSelectBalance(store.zkBalances, i);
        }
        if (
          i === lastBalanceId &&
          !TransactionStore.symbolName &&
          store.zkBalances[i].balance < +formattedFee
        ) {
          autoSelectBalance(store.zkBalances, 0);
        }
      }
    }, [
      store.zkBalances,
      store.zkWallet,
      TransactionStore.changePubKeyFees,
      TransactionStore.symbolName,
      TransactionStore.maxValue,
    ]);

    useEffect(() => {
      if (balances?.length === 1 && store.unlocked) {
        autoSelectBalance(balances, 0);
      }
    }, [title, selectedContact, selectedBalance]);

    useMobxEffect(() => {
      if (
        (TransactionStore.tokenAddress &&
          TransactionStore.tokenAddress === 'ETH') ||
        TransactionStore.symbolName === 'ETH'
      ) {
        setUnlockFau(true);
      }

      if (
        TransactionStore.tokenAddress &&
        zkWallet &&
        TransactionStore.symbolName !== 'ETH' &&
        !store.isExternalWallet
      ) {
        zkWallet
          .isERC20DepositsApproved(TransactionStore.tokenAddress)
          .then(res => {
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
            handleTransferFee(feeToken, el.address);
          }
        });
      }

      if (unlockFau && isUnlockingProcess) {
        setUnlockFau(true);
        handleManageUnlockingTokens();
        setUnlockingERCProcess(false);
        TransactionStore.isLoading = false;
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
      TransactionStore.gas,
      handleCancel,
      handleClickOutside,
      handleSelect,
      TransactionStore.isBalancesListOpen,
      TransactionStore.isContactsListOpen,
      isUnlockingProcess,
      onChangeAddress,
      selected,
      selectedContact,
      TransactionStore.filteredContacts,
      TransactionStore.maxValue,
      setSelected,
      setSelectedContact,
      setSymbol,
      TransactionStore.symbolName,
      setUnlockFau,
      setUnlockingERCProcess,
      setWalletName,
      TransactionStore.symbolName,
      title,
      TransactionStore.tokenAddress,
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
          TransactionStore.gas = data;
        });
    }, [store.zkWallet]);

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
      TransactionStore.isLoading = true;
      if (!store.isBurnerWallet) {
        store.hint = 'Follow the instructions in the pop up';
      }
      store.zkWallet
        ?.approveERC20TokenDeposits(TransactionStore.tokenAddress)
        .then(res => {
          TransactionStore.isLoading = false;
          setUnlockingERCProcess(false);
          store.tokenInUnlockingProgress = store.tokenInUnlockingProgress.concat(
            [TransactionStore.tokenAddress],
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
          TransactionStore.isLoading = false;
          setUnlockingERCProcess(false);
        });
      const setUnlocked = async () => {
        const checkApprove = await zkWallet
          ?.isERC20DepositsApproved(TransactionStore.tokenAddress)
          .then(res => res);
        if (checkApprove) {
          handleManageUnlockingTokens();
          setUnlockFau(checkApprove);
          setUnlockingERCProcess(false);
        }
      };
      setUnlocked();
      if (
        !unlockFau &&
        store.tokenInUnlockingProgress.includes(TransactionStore.tokenAddress)
      ) {
        setInterval(() => {
          setUnlocked();
        }, 1000);
      }
    }, [
      TransactionStore.tokenAddress,
      unlockFau,
      zkWallet,
      store.tokenInUnlockingProgress,
      TransactionStore.isLoading,
    ]);

    useEffect(() => {
      if (TransactionStore.symbolName === 'MLTT' && title === 'Withdraw') {
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
    }, [
      TransactionStore.symbolName,
      title,
      TransactionStore.isBalancesListOpen,
      isTwitExist,
    ]);

    const handleInputWidth = useCallback(
      e => {
        const el = myRef.current;
        if (el) {
          el.style.minWidth =
            (window?.innerWidth > WIDTH_BP ? 260 : 120) + 'px';
          el.style.width =
            (e === TransactionStore.maxValue && e.toString() !== '0'
              ? e.toString().length
              : el.value.length + 1) + 'ch';
        }
      },
      [inputValue, TransactionStore.maxValue],
    );

    const handleSumbit = useCallback(() => {
      if (submitCondition) {
        if (
          TransactionStore.symbolName === 'MLTT' &&
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
          //   transactionAction(token, type, TransactionStore.symbolName);
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
          //       transactionAction(token, type, TransactionStore.symbolName);
          //     }
          //   });
          // };
          // twitExist();
        } else {
          store.txButtonUnlocked = false;
          transactionAction(
            TransactionStore.tokenAddress,
            type,
            TransactionStore.symbolName,
          );
        }
      }
      if (!selectedBalance || (inputValue && +inputValue <= 0) || !inputValue) {
        TransactionStore.conditionError = `Please select the token and set the ${title.toLowerCase()} amount`;
      }
      if (
        !ADDRESS_VALIDATION['eth'].test(addressValue) &&
        title !== 'Deposit'
      ) {
        TransactionStore.conditionError =
          'Adress does not match ethereum address format';
      }
    }, [
      addressValue,
      inputValue,
      selectedBalance,
      TransactionStore.conditionError,
      unlockFau,
      submitCondition,
      isTwitExist,
      store.zkWallet,
      TransactionStore.symbolName,
      title,
    ]);

    const selectFilteredContact = (name, address) => {
      handleSelect(name);
      store.walletAddress = { name, address };
      onChangeAddress(address);
      handleFee(undefined, undefined, address),
        (TransactionStore.isContactsListOpen = false);
      setSelectedContact(name);
      handleTransferFee(feeToken, address);
      TransactionStore.conditionError = '';
      body?.classList.remove('fixed-b');
      TransactionStore.filteredContacts = [];
    };

    const ContactList = ({ address, name }) => (
      <div
        className='balances-contact'
        key={name}
        onClick={() => {
          handleSelect(name);
          store.walletAddress = { name, address };
          onChangeAddress(address);
          handleFee(undefined, undefined, address),
            (TransactionStore.isContactsListOpen = false);
          handleTransferFee(feeToken, address);
          TransactionStore.conditionError = '';
          setSelected(true);
          body?.classList.remove('fixed-b');
          TransactionStore.filteredContacts = [];
        }}
      >
        <div className='balances-contact-left'>
          <p className='balances-contact-name'>{name}</p>
          <span className='balances-contact-address'>
            {window?.innerWidth > WIDTH_BP
              ? address
              : addressMiddleCutter(address, 14, 4)}
          </span>
        </div>
        <div className='balances-contact-right'></div>
      </div>
    );

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

    async function getBalanceOnContract(
      ethSigner: ethers.Signer,
      zksyncProvider: Provider,
      token: TokenLike,
    ) {
      const tokenId = zksyncProvider.tokenSet.resolveTokenId(token);
      if (ethSigner.provider) {
        const contractBalance = await AccountStore.zksContract?.getBalanceToWithdraw(
          AccountStore.ethSignerAddress,
          tokenId,
        );
        return contractBalance;
      }
    }

    useEffect(() => {
      const getSignerAddress = async () => {
        if (!store.zkWallet) return;

        const ethSigner = await store.zkWallet?.ethSigner;

        const zksContract = new ethers.Contract(
          store.zkWallet?.provider.contractAddress.mainContract,
          ABI,
          ethSigner.provider,
        );

        AccountStore.zksContract = zksContract;
        AccountStore.ethSignerAddress = (await store.zkWallet?.ethSigner.getAddress()) as string;
      };
      getSignerAddress();
    }, [store.zkWallet]);

    useEffect(() => {
      if (
        !store.zkWallet ||
        !ExternaWalletStore.externalWalletEthersSigner ||
        !store.tokens ||
        !AccountStore.ethSignerAddress ||
        !AccountStore.zksContract
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
                obj[key] = res;
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
      AccountStore.ethSignerAddress,
      AccountStore.zksContract,
    ]);

    useEffect(() => {
      if (!store.zkWallet) return;
    }, [ExternaWalletStore.externalWalletContractBalances, store.zkWallet]);

    const mainContract = store.zkWallet?.provider.contractAddress.mainContract;
    const etherscanContracLink = `//${LINKS_CONFIG.ethBlockExplorer}/address/${mainContract}#writeProxyContract`;

    const ExternalWalletBalance = ({ balance, symbol }) => (
      <div className='external-wallet-wrapper'>
        <div>
          {symbol} {balance && handleExponentialNumbers(balance)}
        </div>
        {balance && (
          <button
            onClick={() => {
              store.modalSpecifier = 'external-wallet-instructions 1';
              TransactionStore.symbolName = symbol;
              TransactionStore.tokenAddress = store.zkWallet?.provider.tokenSet.resolveTokenAddress(
                symbol,
              ) as string;
              TransactionStore.maxValue = balance;
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
                TransactionStore.symbolName = symbol;
                TransactionStore.tokenAddress = store.zkWallet?.provider.tokenSet.resolveTokenAddress(
                  symbol,
                ) as string;
                TransactionStore.maxValue =
                  ExternaWalletStore.externalWalletContractBalances[symbol];
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
              {balance && handleExponentialNumbers(balance)}
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
          if (!store.zkWallet) return;
          const formattedFee =
            feeToken &&
            feeBasedOntype &&
            TransactionStore.fee[symbol] &&
            handleFormatToken(
              store.zkWallet,
              symbol,
              TransactionStore.fee[symbol],
            );
          if (store.isExternalWallet) {
            return;
          }
          if (TransactionStore.feeTokenSelection) {
            if (
              TransactionStore.symbolName === symbol &&
              +TransactionStore.amountValue + +formattedFee >
                +TransactionStore.maxValue
            ) {
              TransactionStore.conditionError =
                'Not enough funds: amount + fee exceeds your balance';
            } else {
              TransactionStore.conditionError = '';
              validateNumbers(+TransactionStore.amountValue);
              setAmount(+TransactionStore.amountValue);
              handleInputWidth(+TransactionStore.amountValue);
              TransactionStore.conditionError = '';
              TransactionStore.pureAmountInputValue = (+TransactionStore.amountValue)?.toString();
            }
            TransactionStore.transferFeeToken = symbol;
            TransactionStore.feeTokenSelection = false;
            TransactionStore.isBalancesListOpen = false;
            return handleTransferFee(symbol);
          }
          if (address === 'awaited') {
            return;
          } else {
            handleUpdateTokenPrice(symbol);
            TransactionStore.tokenAddress = address;
            TransactionStore.maxValue = balance;
            TransactionStore.symbolName = symbol;
            setSymbol(symbol);
            handleSelect(symbol);
            TransactionStore.isBalancesListOpen = false;
            setSelected(true);
            TransactionStore.conditionError = '';
            handleInputWidth(1);
            validateNumbers('');
            TransactionStore.amountValue = 0;
            TransactionStore.pureAmountInputValue = '';
            if (title === 'Transfer') {
              TransactionStore.transferFeeToken = symbol;
              handleTransferFee(symbol);
            } else {
              handleFee(inputValue, symbol);
            }
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
        return handleExponentialNumbers(TransactionStore.maxValue).toString();
      }
    };

    useEffect(() => {
      store.txButtonUnlocked = true;
    }, [store.zkWallet, selectedBalance]);

    const MLTTFeePrice = TransactionStore.symbolName === 'MLTT' ? 1 : 0;

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
        TransactionStore.symbolName &&
        feeBasedOntype &&
        ADDRESS_VALIDATION['eth'].test(addressValue);

      const exceedBalanceTrigger = feeArg => {
        return (
          +inputValue +
            +handleFormatToken(
              store.zkWallet as Wallet,
              TransactionStore.symbolName,
              feeArg,
            ) >=
          +TransactionStore.maxValue
        );
      };

      const valueHandler = () => {
        const maxValueInSelected =
          +TransactionStore.pureAmountInputValue +
            +handleFormatToken(
              store.zkWallet as Wallet,
              TransactionStore.symbolName,
              TransactionStore.fee[TransactionStore.symbolName],
            ) >=
          +TransactionStore.maxValue;

        if (store.fastWithdrawal && !!maxValueInSelected) {
          return (
            +TransactionStore.pureAmountInputValue -
            +handleFormatToken(
              store.zkWallet as Wallet,
              TransactionStore.symbolName,
              TransactionStore.fastFee,
            )
          );
        }
        if (!store.fastWithdrawal && !!maxValueInSelected) {
          return (
            +TransactionStore.pureAmountInputValue -
            +handleFormatToken(
              store.zkWallet as Wallet,
              TransactionStore.symbolName,
              TransactionStore.fee[TransactionStore.symbolName],
            )
          );
        } else {
          return +TransactionStore.pureAmountInputValue;
        }
      };

      const radioButtonCb = fee => {
        store.fastWithdrawal = !store.fastWithdrawal;
        if (!inputValue) return;
        if (exceedBalanceTrigger(fee)) {
          return (TransactionStore.conditionError =
            'Not enough funds: amount + fee exceeds your balance');
        }
        TransactionStore.amountValue = valueHandler();
        validateNumbers(valueHandler()?.toString());
        setAmount(valueHandler() as number);
        handleInputWidth(valueHandler() as number);
        TransactionStore.conditionError = '';
        TransactionStore.pureAmountInputValue = valueHandler()?.toString();
      };

      return (
        <>
          {!!showFeeCondition && store.zkWallet && (
            <div
              className='withdraw-type-block'
              onClick={() => {
                radioButtonCb(
                  TransactionStore.fee[TransactionStore.symbolName],
                );
              }}
            >
              <RadioButton selected={!store.fastWithdrawal} />
              <p className='checkbox-text'>{`Normal (fee ${TransactionStore.fee[
                TransactionStore.symbolName
              ] &&
                handleFormatToken(
                  store.zkWallet,
                  TransactionStore.symbolName,
                  TransactionStore.fee[TransactionStore.symbolName],
                )} ${
                TransactionStore.symbolName
              }), processing time ${timeStempString(withdrawalTime)}`}</p>
            </div>
          )}
          {!!showFeeCondition && store.zkWallet && (
            <div
              className='withdraw-type-block'
              onClick={() => {
                radioButtonCb(TransactionStore.fastFee);
              }}
            >
              <RadioButton selected={store.fastWithdrawal} />
              <p className='checkbox-text'>{`Fast (fee ${+TransactionStore.fastFee &&
                handleFormatToken(
                  store.zkWallet,
                  TransactionStore.symbolName,
                  TransactionStore.fastFee,
                )} ${
                TransactionStore.symbolName
              }), processing time ${timeStempString(fastWithdrawalTime)}`}</p>
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
          <AmountToWithdraw />
        </Modal>
        <Modal
          visible={false}
          classSpecifier='external-wallet-instructions 2'
          clickOutside={false}
          background={true}
          centered
        >
          <CompleteWithdrawal />
        </Modal>
        <div
          className={`assets-wrapper ${
            TransactionStore.isContactsListOpen ||
            TransactionStore.isBalancesListOpen
              ? 'open'
              : 'closed'
          }`}
        >
          {TransactionStore.isContactsListOpen && (
            <DataList
              data={searchContacts}
              title='Select contact'
              header={() => (
                <>
                  <button
                    onClick={() => {
                      TransactionStore.isContactsListOpen = false;
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
          {TransactionStore.isBalancesListOpen && (
            <DataList
              data={title === 'Deposit' ? store.ethBalances : store.zkBalances}
              title={`Balances in ${title === 'Deposit' ? 'L1' : 'L2'}`}
              footer={() => (
                <div className='hint-datalist-wrapper'>
                  <button
                    onClick={() => {
                      if (store.isExternalWallet) {
                        TransactionStore.isBalancesListOpen = false;
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
                    TransactionStore.isBalancesListOpen = false;
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
            !AccountStore.isAccountUnlockingProcess &&
            title !== 'Deposit' &&
            zkBalancesLoaded &&
            (!!store.isAccountBalanceNotEmpty || store.isExternalWallet) &&
            !store.isBurnerWallet &&
            (!store.isExternalWallet ? (
              <LockedTx
                handleCancel={handleCancel}
                handleUnlock={() => handleUnlockWithUseCallBack()}
                symbolName={TransactionStore.symbolName}
                handleSelectBalance={autoSelectBalanceForUnlock}
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
                handleFormatToken(
                  store.zkWallet,
                  TransactionStore.symbolName,
                  feeBasedOntype,
                )
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
              symbolName={TransactionStore.symbolName}
              title={title}
            />
          )}
          {((!isExecuted &&
            (store.unlocked === undefined ||
              TransactionStore.isLoading ||
              !zkBalancesLoaded)) ||
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
                      TransactionStore.fee[TransactionStore.symbolName] &&
                      store.zkWallet &&
                      handleFormatToken(
                        store.zkWallet,
                        TransactionStore.symbolName,
                        TransactionStore.fee[TransactionStore.symbolName],
                      )
                    }
                    price={
                      +(price && !!price[selectedBalance]
                        ? price[selectedBalance]
                        : 0)
                    }
                    isUnlockingProcess={isUnlockingProcess}
                    inputValue={inputValue}
                    symbolName={TransactionStore.symbolName}
                    addressValue={addressValue}
                    handleCancel={handleCancel}
                    setWalletName={setWalletName}
                    title={title}
                    unlockFau={unlockFau}
                    setUnlockingERCProcess={setUnlockingERCProcess}
                  />

                  {hint.match(/(?:denied)/i) && !TransactionStore.isLoading && (
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
            !TransactionStore.isLoading &&
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
                    TransactionStore.symbolName = '';
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
                                  handleTransferFee(feeToken, e.target.value);
                                  if (
                                    ADDRESS_VALIDATION['eth'].test(addressValue)
                                  ) {
                                    TransactionStore.conditionError = '';
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
                                      TransactionStore.isContactsListOpen = !TransactionStore.isContactsListOpen;
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
                                    TransactionStore.fee = {};
                                  }}
                                ></button>
                              )}
                            </div>
                          </div>
                          {!!TransactionStore.filteredContacts.length &&
                            addressValue && (
                              <FilteredContactList
                                filteredContacts={
                                  TransactionStore.filteredContacts
                                }
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
                                  if (!TransactionStore.symbolName) return;
                                  TransactionStore.amountValue = +e.target
                                    .value;
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
                                  TransactionStore.isBalancesListOpen = !TransactionStore.isBalancesListOpen;
                                  body?.classList.add('fixed-b');
                                }}
                                className='custom-selector-title'
                              >
                                {TransactionStore.symbolName ? (
                                  <p>{TransactionStore.symbolName}</p>
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
                                key={TransactionStore.tokenAddress}
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
                                        TransactionStore.amountValue =
                                          TransactionStore.maxValue;
                                        validateNumbers(
                                          TransactionStore.maxValue.toString(),
                                          true,
                                        );
                                        handleInputWidth(calculateMaxValue());
                                        handleFee(calculateMaxValue());
                                        handleTransferFee(feeToken);
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
                                          {'Max: '}
                                          {handleExponentialNumbers(
                                            TransactionStore.maxValue,
                                          )}{' '}
                                        </>
                                      )}
                                    {TransactionStore.symbolName &&
                                    selectedBalance &&
                                    ((feeBasedOntype &&
                                      ADDRESS_VALIDATION['eth'].test(
                                        addressValue,
                                      )) ||
                                      title === 'Deposit')
                                      ? TransactionStore.symbolName
                                      : ''}
                                  </button>
                                )}
                                {!feeBasedOntype &&
                                  !!selectedBalance &&
                                  title !== 'Deposit' && (
                                    <p className='all-balance-empty'>
                                      {'Max: '}
                                      {handleExponentialNumbers(
                                        TransactionStore.maxValue,
                                      )}{' '}
                                      {TransactionStore.symbolName}
                                    </p>
                                  )}
                              </div>
                            ) : (
                              <div
                                className='currency-input-wrapper'
                                key={TransactionStore.tokenAddress}
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
                      TransactionStore.tokenAddress !== 'ETH' &&
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
                                  {TransactionStore.symbolName.length
                                    ? TransactionStore.symbolName
                                    : balances?.length && balances[0].symbol}
                                  {' token unlocked'}
                                </p>
                              ) : (
                                <p>
                                  {`${
                                    store.tokenInUnlockingProgress.includes(
                                      TransactionStore.tokenAddress,
                                    )
                                      ? 'Unlocking'
                                      : 'Unlock'
                                  } `}
                                  {TransactionStore.symbolName.length
                                    ? TransactionStore.symbolName
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
                            {store.tokenInUnlockingProgress.includes(
                              TransactionStore.tokenAddress,
                            ) ? (
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
                            +inputValue >= TransactionStore.maxValue) ||
                          !!TransactionStore.conditionError
                            ? 'visible'
                            : ''
                        }`}
                      >
                        {!!inputValue &&
                        selectedBalance &&
                        title !== 'Deposit' &&
                        +inputValue > TransactionStore.maxValue
                          ? 'Not enough funds: amount + fee exceeds your balance'
                          : TransactionStore.conditionError}
                      </p>
                    </div>
                    {!!store.txButtonUnlocked ? (
                      <button
                        className={`btn submit-button ${
                          (!unlockFau &&
                            !store.EIP1271Signature &&
                            !store.tokenInUnlockingProgress.includes(
                              TransactionStore.tokenAddress,
                            ) &&
                            title === 'Deposit') ||
                          !inputValue ||
                          (!!inputValue &&
                            +inputValue > TransactionStore.maxValue) ||
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

                    {title === 'Withdraw' &&
                      (fastWithdrawalTime || withdrawalTime) && (
                        <p className='withdraw-hint'>
                          {`Your withdrawal should take max. ${timeStempString(
                            store.fastWithdrawal
                              ? fastWithdrawalTime
                              : withdrawalTime,
                          )}.`}
                        </p>
                      )}
                    <div className='transaction-fee-wrapper'>
                      <p
                        key={TransactionStore.maxValue}
                        className='transaction-fee'
                      >
                        {!!selectedBalance &&
                          feeBasedOntype &&
                          ADDRESS_VALIDATION['eth'].test(addressValue) &&
                          title !== 'Deposit' && (
                            <>
                              {'Fee: '}
                              {store.zkWallet &&
                                feeToken &&
                                feeBasedOntype &&
                                ADDRESS_VALIDATION['eth'].test(addressValue) &&
                                handleFormatToken(
                                  store.zkWallet,
                                  feeToken,
                                  feeBasedOntype,
                                )}
                              <button
                                onClick={() => {
                                  TransactionStore.feeTokenSelection = true;
                                  TransactionStore.isBalancesListOpen = true;
                                }}
                                className='undo-btn marginless'
                              >
                                {feeToken}
                              </button>
                              {store.zkWallet && feeBasedOntype && (
                                <span>
                                  {' ~$'}
                                  {
                                    +(
                                      +(price && !!price[feeToken]
                                        ? price[feeToken]
                                        : MLTTFeePrice) *
                                      +handleFormatToken(
                                        store.zkWallet,
                                        feeToken,
                                        feeBasedOntype,
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
          {!AccountStore.isAccountUnlockingProcess &&
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
                        TransactionStore.symbolName = '';
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
