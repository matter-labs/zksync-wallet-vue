import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { getDefaultProvider } from 'ethers';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';
import Spinner from 'src/components/Spinner/Spinner';

import { IEthBalance } from 'types/Common';

import { useTransaction } from 'hooks/useTransaction';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useStore } from 'src/store/context';

import { handleFormatToken, getConfirmationCount } from 'src/utils';
import { fetchTransactions } from 'src/api';
import { LINKS_CONFIG } from 'src/config';
import {
  handleExponentialNumbers,
  sortBalancesByBalance,
  sortBalancesById,
} from 'src/utils';

import { DEFAULT_ERROR } from 'constants/errors';

interface BalProps {
  balance: IEthBalance;
  handleSend: (address: any, balance: any, symbol: any) => void;
}

const VerifiedBal: React.FC<BalProps> = observer(
  ({ handleSend, balance: { address, symbol, balance } }) => {
    const store = useStore();
    const { price } = store;
    return (
      <div
        key={balance}
        className={`balances-token verified ${+balance === 0 ? 'empty' : ''}`}
        onClick={() => {
          if (address === 'awaited' || +balance === 0) return;
          handleSend(address, balance, symbol);
        }}
      >
        <div className='balances-token-left'>{symbol}</div>
        <div className='balances-token-right'>
          <div className='balances-token-right container'>
            <div className='current-tokens'>
              <span>{handleExponentialNumbers(+balance)}</span>{' '}
              {price && (
                <span className='token-price'>
                  {`~$${+(
                    balance * +(price && !!price[symbol] ? price[symbol] : 0)
                  ).toFixed(2)}`}
                </span>
              )}
              <div className='balances-token-status'>
                <span className='label-done'>
                  <span className='tooltip'>{'Verified'}</span>
                </span>
              </div>
            </div>
            <div className='awaited-tokens-block'>
              {store.awaitedTokens[symbol]?.amount && (
                <>
                  <span className='awaited-tokens'>
                    {`+ ${store.zkWallet &&
                      handleExponentialNumbers(
                        +handleFormatToken(
                          store.zkWallet,
                          symbol,
                          store.awaitedTokens[symbol]?.amount
                            ? +store.awaitedTokens[symbol]?.amount
                            : 0,
                        ),
                      )}`}
                  </span>
                  {price &&
                    store.zkWallet &&
                    store.awaitedTokens[symbol]?.amount &&
                    symbol && (
                      <span className='awaited-tokens'>
                        {`(~$${+(
                          (store.zkWallet &&
                            +handleFormatToken(
                              store.zkWallet,
                              symbol,
                              store.awaitedTokens[symbol]?.amount
                                ? +store.awaitedTokens[symbol]?.amount
                                : 0,
                            )) * +(price && !!price[symbol] ? price[symbol] : 0)
                        ).toFixed(2)})`}
                      </span>
                    )}
                  <span className='awaited-tokens'>{`(${
                    store.awaitedTokensConfirmations[symbol] &&
                    store.awaitedTokensConfirmations[symbol].confirmations !==
                      undefined
                      ? store.awaitedTokensConfirmations[symbol].confirmations
                      : 0
                  }/${store.maxConfirmAmount} confirmations)`}</span>
                  <SpinnerWorm title='Pending' />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const UnverifiedBal: React.FC<BalProps> = observer(
  ({ handleSend, balance: { address, symbol, balance } }) => {
    const store = useStore();
    const { price } = store;
    return (
      <div
        className={`balances-token verified ${+balance === 0 ? 'empty' : ''}`}
        onClick={() => {
          if (address === 'awaited') return;
          handleSend(address, balance, symbol);
        }}
      >
        <div className='balances-token-left'>{symbol}</div>
        <div className='balances-token-right'>
          <div className='balances-token-right container'>
            <div className='current-tokens'>
              <span>{handleExponentialNumbers(+balance)}</span>{' '}
              {price && (
                <span className='token-price'>
                  {`~$${+(
                    balance * +(price && !!price[symbol] ? price[symbol] : 0)
                  ).toFixed(2)}`}
                </span>
              )}
              <div className='balances-token-status'>
                <span className='label-verifying'>
                  <span className='tooltip'>{'Pending'}</span>
                </span>
              </div>
            </div>
            <div className='awaited-tokens-block'>
              {store.awaitedTokens[symbol]?.amount && (
                <>
                  <span className='awaited-tokens'>
                    {`+ ${store.zkWallet &&
                      handleExponentialNumbers(
                        +handleFormatToken(
                          store.zkWallet,
                          symbol,
                          store.awaitedTokens[symbol]?.amount
                            ? +store.awaitedTokens[symbol]?.amount
                            : 0,
                        ),
                      )}`}
                  </span>
                  {price &&
                    store.zkWallet &&
                    store.awaitedTokens[symbol]?.amount &&
                    symbol && (
                      <span className='awaited-tokens'>
                        {`(~$${+(
                          (store.zkWallet &&
                            +handleFormatToken(
                              store.zkWallet,
                              symbol,
                              store.awaitedTokens[symbol]?.amount
                                ? +store.awaitedTokens[symbol]?.amount
                                : 0,
                            )) * +(price && !!price[symbol] ? price[symbol] : 0)
                        ).toFixed(2)})`}
                      </span>
                    )}
                  <span className='awaited-tokens'>{`(${
                    store.awaitedTokensConfirmations[symbol] &&
                    store.awaitedTokensConfirmations[symbol].confirmations !==
                      undefined
                      ? store.awaitedTokensConfirmations[symbol].confirmations
                      : 0
                  }/${store.maxConfirmAmount} confirmations)`}</span>
                  <SpinnerWorm title='Pending' />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const Account: React.FC = observer(() => {
  const { setMaxValueProp, setSymbolNameProp, setTokenProp } = useTransaction();

  const history = useHistory();
  const store = useStore();
  const { zkWallet, accountState, tokens, TransactionStore } = store;
  const [transactionsList, setTransactionList] = useState<any>([]);

  const getAccState = useCallback(
    async (extended: boolean) => {
      const { zkWallet, accountState, tokens } = store;
      if (zkWallet && tokens) {
        const _accountState = await zkWallet.getAccountState();
        if (JSON.stringify(accountState) !== JSON.stringify(_accountState)) {
          store.accountState = _accountState;
        }
        const txs = fetchTransactions(
          25,
          0,
          store.zkWalletAddress as string,
        ).then(res => setTransactionList(res));
        const at = _accountState.depositing.balances;
        const atKeys = Object.keys(at);
        if (!!atKeys.length) {
          const txs = fetchTransactions(
            25,
            0,
            store.zkWalletAddress as string,
          ).then(res => res);
          const sortedByTypeTxs = transactionsList.filter(
            tx => tx.commited === false && tx.tx.type === 'Deposit',
          );
          sortedByTypeTxs.map(tx => {
            const _token = tx.tx.priority_op?.token;
            if (!!store.awaitedTokens[_token as string]) {
              const arr = sortedByTypeTxs.filter(
                _tx => _tx.tx.priority_op?.token === _token,
              );
              const sortedByBlockTxs = arr.sort(
                (a, b) => b.eth_block - a.eth_block,
              );
              const _p = getDefaultProvider(LINKS_CONFIG.network);
              const confirmations = getConfirmationCount(
                _p,
                sortedByBlockTxs[0].hash,
                store.awaitedTokens[_token as string].expectedAcceptBlock,
              ).then(res => {
                store.awaitedTokensConfirmations = store.awaitedTokens;
                store.awaitedTokensConfirmations[
                  _token as string
                ].confirmations = store.maxConfirmAmount - res;
              });
            }
          });
        }
        if (JSON.stringify(store.awaitedTokens) !== JSON.stringify(at)) {
          store.awaitedTokens = at;
        }
        if (extended) {
          const zkBalance = _accountState.committed.balances;

          const zkBalancePromises = Object.keys(zkBalance).map(async key => {
            return {
              address: tokens[key].address,
              balance: +handleFormatToken(
                zkWallet,
                tokens[key].symbol,
                +zkBalance[key] ? +zkBalance[key] : 0,
              ),
              symbol: tokens[key].symbol,
              id: tokens[key].id,
            };
          });
          Promise.all(zkBalancePromises)
            .then(res => {
              if (Object.keys(store.awaitedTokens).length > 0) {
                for (const token in store.awaitedTokens) {
                  const _list = Object.entries(res).map(el => el[1].symbol);
                  if (_list.indexOf(token) === -1) {
                    store.zkBalancesLoaded = true;
                    store.zkBalances = res
                      .concat([
                        {
                          symbol: token,
                          balance: 0,
                          address: 'awaited',
                          id: 999,
                        },
                      ])
                      .sort(sortBalancesById);
                  } else {
                    if (
                      JSON.stringify(store.zkBalances) !== JSON.stringify(res)
                    ) {
                      const MLTTAccountBalance = store.zkBalances.filter(
                        t => t.symbol === 'MLTT',
                      );
                      const MLTTIncomingBalance = res.filter(
                        t => t.symbol === 'MLTT',
                      );
                      if (
                        MLTTIncomingBalance.length === 1 &&
                        MLTTAccountBalance.length === 0
                      ) {
                        store.MLTTclaimed = true;
                      } else if (
                        MLTTIncomingBalance.length === 1 &&
                        MLTTAccountBalance.length === 1 &&
                        MLTTIncomingBalance[0].balance >
                          MLTTAccountBalance[0].balance
                      ) {
                        store.MLTTclaimed = true;
                      }
                      store.zkBalancesLoaded = true;
                      store.zkBalances = res.sort(sortBalancesById);
                    }
                  }
                }
              } else {
                if (JSON.stringify(store.zkBalances) !== JSON.stringify(res)) {
                  const MLTTAccountBalance = store.zkBalances.filter(
                    t => t.symbol === 'MLTT',
                  );
                  const MLTTIncomingBalance = res.filter(
                    t => t.symbol === 'MLTT',
                  );
                  if (
                    MLTTIncomingBalance.length === 1 &&
                    MLTTAccountBalance.length === 0
                  ) {
                    store.MLTTclaimed = true;
                  } else if (
                    MLTTIncomingBalance.length === 1 &&
                    MLTTAccountBalance.length === 1 &&
                    MLTTIncomingBalance[0].balance >
                      MLTTAccountBalance[0].balance
                  ) {
                    store.MLTTclaimed = true;
                  }
                  store.zkBalancesLoaded = true;
                  store.zkBalances = res.sort(sortBalancesById);
                }
              }
            })
            .then(() => {
              zkWallet?.isSigningKeySet().then(data => {
                store.unlocked = data;
              });
            })
            .catch(err => {
              err.name && err.message
                ? (store.error = `${err.name}: ${err.message}`)
                : (store.error = DEFAULT_ERROR);
            });
        }
      }
      if (
        JSON.stringify(accountState?.verified.balances) !==
          JSON.stringify(store.verified) &&
        zkWallet
      ) {
        store.verified = (await zkWallet.getAccountState()).verified.balances;
      }
    },
    [
      accountState,
      store.accountState,
      store.awaitedTokens,
      store.error,
      store.unlocked,
      store.verified,
      store.zkBalances,
      tokens,
      zkWallet,
      transactionsList,
      setTransactionList,
    ],
  );

  const getVerified = useCallback(async () => {
    if (zkWallet) {
      store.verified = (await zkWallet.getAccountState()).verified.balances;
    }
  }, [zkWallet]);

  useEffect(() => {
    if (!store.zkWallet) return;
    getAccState(true);
    getVerified();
  }, [getVerified, store.zkWallet, store.zkBalancesLoaded, store.tokens]);

  useEffect(() => {
    store.propsSymbolName = '';
    store.propsMaxValue = '';
    store.propsToken = '';
  }, []);

  useEffect(() => {
    if (!zkWallet) return;

    const int = setInterval(() => getAccState(true), 3000);

    return () => {
      clearInterval(int);
    };
  }, [
    store,
    store.zkWallet,
    store.accountState,
    store.awaitedTokens,
    store.tokens,
    store.zkBalances,
    store.searchBalances,
    store.verified,
  ]);

  const handleSend = useCallback(
    (address, balance, symbol) => {
      history.push(`/account/${symbol.toLowerCase()}`);
      store.propsMaxValue = balance;
      TransactionStore.maxValue = balance;
      store.propsSymbolName = symbol;
      TransactionStore.symbolName = symbol;
      store.propsToken = address;
      TransactionStore.tokenAddress = address;
    },
    [history, setMaxValueProp, setSymbolNameProp, setTokenProp, store],
  );

  useCheckLogin();

  const isVerified = ({ symbol }) => {
    const filtered = transactionsList
      .filter(tx =>
        tx.tx.type === 'Deposit'
          ? tx.tx.priority_op?.token === symbol
          : tx.tx.token === symbol,
      )
      .filter(ftx => ftx.verified !== true);
    const condition = filtered.length === 0;
    return condition;
  };

  const { ethBalances, price, zkBalances, zkBalancesLoaded } = store;
  const ApiFailedHint = () =>
    !store.price && store.zkBalancesLoaded ? null : null;

  const Balance = ({ verified, balance }) => {
    return !!verified ? (
      <VerifiedBal handleSend={handleSend} balance={balance} />
    ) : (
      <UnverifiedBal handleSend={handleSend} balance={balance} />
    );
  };

  return (
    <>
      <MyWallet
        balances={ethBalances}
        price={price}
        title='zkSync Wallet'
        setTransactionType={t => {
          store.transactionType = t;
        }}
      />
      <DataList
        data={zkBalances}
        title='Balances in L2'
        visible={true}
        footer={ApiFailedHint}
        setTransactionType={t => {
          store.transactionType = t;
        }}
        renderItem={balance => (
          <Balance
            key={balance.address}
            verified={isVerified(balance)}
            balance={balance}
          />
        )}
        emptyListComponent={() =>
          zkBalancesLoaded && !store.isAccountBalanceLoading ? null : (
            <Spinner />
          )
        }
      />
    </>
  );
});

export default Account;
