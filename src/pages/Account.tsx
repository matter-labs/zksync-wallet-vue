import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { getDefaultProvider } from 'ethers';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';
import Spinner from 'src/components/Spinner/Spinner';

import { IEthBalance } from 'types/Common';

import { useCancelable } from 'hooks/useCancelable';
import { useTransaction } from 'hooks/useTransaction';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useStore } from 'src/store/context';

import { handleFormatToken, getConfirmationCount } from 'src/utils';
import { fetchTransactions } from 'src/api';
import { LINKS_CONFIG } from 'src/config';
import {
  handleExponentialNumbers,
  intervalAsyncStateUpdater,
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
    const { TokensStore } = store;
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
              {TokensStore.tokenPrices && (
                <span className='token-TokensStore.tokenPrices'>
                  {`~$${+(
                    balance *
                    +(TokensStore.tokenPrices &&
                    !!TokensStore.tokenPrices[symbol]
                      ? TokensStore.tokenPrices[symbol]
                      : 0)
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
              {TokensStore.awaitedTokens[symbol]?.amount && (
                <>
                  <span className='awaited-tokens'>
                    {`+ ${store.zkWallet &&
                      handleExponentialNumbers(
                        +handleFormatToken(
                          store.zkWallet,
                          symbol,
                          TokensStore.awaitedTokens[symbol]?.amount
                            ? TokensStore.awaitedTokens[symbol]?.amount
                            : 0,
                        ),
                      )}`}
                  </span>
                  {TokensStore.tokenPrices &&
                    store.zkWallet &&
                    TokensStore.awaitedTokens[symbol]?.amount &&
                    symbol && (
                      <span className='awaited-tokens'>
                        {`(~$${+(
                          (store.zkWallet &&
                            +handleFormatToken(
                              store.zkWallet,
                              symbol,
                              TokensStore.awaitedTokens[symbol]?.amount
                                ? TokensStore.awaitedTokens[symbol]?.amount
                                : 0,
                            )) *
                          +(TokensStore.tokenPrices &&
                          !!TokensStore.tokenPrices[symbol]
                            ? TokensStore.tokenPrices[symbol]
                            : 0)
                        ).toFixed(2)})`}
                      </span>
                    )}
                  <span className='awaited-tokens'>{`(${
                    TokensStore.awaitedTokensConfirmations[symbol] &&
                    TokensStore.awaitedTokensConfirmations[symbol]
                      .confirmations !== undefined
                      ? TokensStore.awaitedTokensConfirmations[symbol]
                          .confirmations
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
    const { TokensStore } = store;
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
              {TokensStore.tokenPrices && (
                <span className='token-TokensStore.tokenPrices'>
                  {`~$${+(
                    balance *
                    +(TokensStore.tokenPrices &&
                    !!TokensStore.tokenPrices[symbol]
                      ? TokensStore.tokenPrices[symbol]
                      : 0)
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
              {TokensStore.awaitedTokens[symbol]?.amount && (
                <>
                  <span className='awaited-tokens'>
                    {`+ ${store.zkWallet &&
                      handleExponentialNumbers(
                        +handleFormatToken(
                          store.zkWallet,
                          symbol,
                          TokensStore.awaitedTokens[symbol]?.amount
                            ? TokensStore.awaitedTokens[symbol]?.amount
                            : 0,
                        ),
                      )}`}
                  </span>
                  {TokensStore.tokenPrices &&
                    store.zkWallet &&
                    TokensStore.awaitedTokens[symbol]?.amount &&
                    symbol && (
                      <span className='awaited-tokens'>
                        {`(~$${+(
                          (store.zkWallet &&
                            +handleFormatToken(
                              store.zkWallet,
                              symbol,
                              TokensStore.awaitedTokens[symbol]?.amount
                                ? TokensStore.awaitedTokens[symbol]?.amount
                                : 0,
                            )) *
                          +(TokensStore.tokenPrices &&
                          !!TokensStore.tokenPrices[symbol]
                            ? TokensStore.tokenPrices[symbol]
                            : 0)
                        ).toFixed(2)})`}
                      </span>
                    )}
                  <span className='awaited-tokens'>{`(${
                    TokensStore.awaitedTokensConfirmations[symbol] &&
                    TokensStore.awaitedTokensConfirmations[symbol]
                      .confirmations !== undefined
                      ? TokensStore.awaitedTokensConfirmations[symbol]
                          .confirmations
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
  const cancelable = useCancelable();

  const history = useHistory();
  const store = useStore();
  const {
    zkWallet,
    accountState,
    TransactionStore,
    AccountStore,
    TokensStore,
  } = store;

  const getAccState = useCallback(
    async (extended: boolean) => {
      const { zkWallet, accountState } = store;
      const { tokens } = TokensStore;
      if (zkWallet && tokens) {
        const _accountState = await zkWallet.getAccountState();
        const txs = fetchTransactions(
          25,
          0,
          store.zkWalletAddress as string,
        ).then(res => res);
        if (JSON.stringify(AccountStore.txs) !== JSON.stringify(await txs)) {
          AccountStore.txs = await txs;
        }
        const at = _accountState.depositing.balances;
        const atKeys = Object.keys(at);
        if (!!atKeys.length) {
          const txs = fetchTransactions(
            25,
            0,
            store.zkWalletAddress as string,
          ).then(res => res);
          const sortedByTypeTxs = AccountStore.txs.filter(
            tx => tx.commited === false && tx.tx.type === 'Deposit',
          );
          sortedByTypeTxs.map(tx => {
            const _token = tx.tx.priority_op?.token;
            if (!!TokensStore.awaitedTokens[_token as string]) {
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
                TokensStore.awaitedTokens[_token as string].expectedAcceptBlock,
              ).then(res => {
                TokensStore.awaitedTokensConfirmations =
                  TokensStore.awaitedTokens;
                TokensStore.awaitedTokensConfirmations[
                  _token as string
                ].confirmations = store.maxConfirmAmount - res;
              });
            }
          });
        }
        if (JSON.stringify(TokensStore.awaitedTokens) !== JSON.stringify(at)) {
          TokensStore.awaitedTokens = at;
        }
        if (extended) {
          const zkBalance = _accountState.committed.balances;

          const zkBalancePromises = Object.keys(zkBalance).map(async key => {
            return {
              address: tokens[key].address,
              balance: +handleFormatToken(
                zkWallet,
                tokens[key].symbol,
                zkBalance[key] ? zkBalance[key] : 0,
              ),
              symbol: tokens[key].symbol,
              id: tokens[key].id,
            };
          });
          Promise.all(zkBalancePromises)
            .then(res => {
              if (Object.keys(TokensStore.awaitedTokens).length > 0) {
                for (const token in TokensStore.awaitedTokens) {
                  const _list = Object.entries(res).map(el => el[1].symbol);
                  if (_list.indexOf(token) === -1) {
                    TokensStore.zkBalancesLoaded = true;
                    TokensStore.zkBalances = res
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
                      JSON.stringify(TokensStore.zkBalances) !==
                      JSON.stringify(res.sort(sortBalancesById))
                    ) {
                      const MLTTAccountBalance = TokensStore.zkBalances.filter(
                        t => t.symbol === 'MLTT',
                      );
                      const MLTTIncomingBalance = res.filter(
                        t => t.symbol === 'MLTT',
                      );
                      if (
                        MLTTIncomingBalance.length === 1 &&
                        MLTTAccountBalance.length === 0
                      ) {
                        TokensStore.MLTTclaimed = true;
                      } else if (
                        MLTTIncomingBalance.length === 1 &&
                        MLTTAccountBalance.length === 1 &&
                        MLTTIncomingBalance[0].balance >
                          MLTTAccountBalance[0].balance
                      ) {
                        TokensStore.MLTTclaimed = true;
                      }
                      TokensStore.zkBalancesLoaded = true;
                      TokensStore.zkBalances = res.sort(sortBalancesById);
                    }
                  }
                }
              } else {
                if (
                  JSON.stringify(TokensStore.zkBalances) !==
                  JSON.stringify(res.sort(sortBalancesById))
                ) {
                  const MLTTAccountBalance = TokensStore.zkBalances.filter(
                    t => t.symbol === 'MLTT',
                  );
                  const MLTTIncomingBalance = res.filter(
                    t => t.symbol === 'MLTT',
                  );
                  if (
                    MLTTIncomingBalance.length === 1 &&
                    MLTTAccountBalance.length === 0
                  ) {
                    TokensStore.MLTTclaimed = true;
                  } else if (
                    MLTTIncomingBalance.length === 1 &&
                    MLTTAccountBalance.length === 1 &&
                    MLTTIncomingBalance[0].balance >
                      MLTTAccountBalance[0].balance
                  ) {
                    TokensStore.MLTTclaimed = true;
                  }
                  TokensStore.zkBalancesLoaded = true;
                  const _balances = res.sort(sortBalancesById);
                  TokensStore.zkBalances = _balances;
                }
              }
            })
            .then(() => {
              zkWallet?.isSigningKeySet().then(data => {
                if (store.unlocked !== data) store.unlocked = data;
              });
            })
            .catch(err => {
              err.name && err.message
                ? (store.error = `${err.name}: ${err.message}`)
                : (store.error = DEFAULT_ERROR);
            });
        }
      }
    },
    [
      accountState,
      store.accountState,
      TokensStore.awaitedTokens,
      store.error,
      store.unlocked,
      TokensStore.zkBalances,
      TokensStore.tokens,
      zkWallet,
      AccountStore.txs,
    ],
  );

  useEffect(() => {
    TransactionStore.propsSymbolName = '';
    TransactionStore.propsMaxValue = '';
    TransactionStore.propsToken = '';
  }, []);

  useEffect(() => {
    if (!zkWallet) return;

    intervalAsyncStateUpdater(getAccState, [true], 3000, cancelable);
  }, [store.zkWallet]);

  const handleSend = useCallback(
    (address, balance, symbol) => {
      history.push(`/account/${symbol.toLowerCase()}`);
      TransactionStore.propsMaxValue = balance;
      TransactionStore.maxValue = balance;
      TransactionStore.propsSymbolName = symbol;
      TransactionStore.symbolName = symbol;
      TransactionStore.setTransferFeeToken(symbol);
      TransactionStore.propsToken = address;
      TransactionStore.tokenAddress = address;
    },
    [history, store],
  );

  useCheckLogin();

  const isVerified = ({ symbol }) => {
    const filtered = AccountStore.txs
      .filter(tx =>
        tx.tx.type === 'Deposit'
          ? tx.tx.priority_op?.token === symbol
          : tx.tx.token === symbol,
      )
      .filter(ftx => ftx.verified !== true);
    const condition = filtered.length === 0;
    return condition;
  };

  const ApiFailedHint = () => null; // Temporarly disable

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
        balances={TokensStore.ethBalances}
        price={TokensStore.tokenPrices}
        title='zkSync Wallet'
        setTransactionType={t => {
          store.transactionType = t;
        }}
      />
      <DataList
        data={TokensStore.zkBalances.sort(sortBalancesById)}
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
          TokensStore.zkBalancesLoaded &&
          !TokensStore.isAccountBalanceLoading ? null : (
            <Spinner />
          )
        }
      />
    </>
  );
});

export default Account;
