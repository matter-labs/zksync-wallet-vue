import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';
import Spinner from 'src/components/Spinner/Spinner';

import { IEthBalance } from 'types/Common';

import { useTransaction } from 'hooks/useTransaction';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useStore } from 'src/store/context';

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
        className='balances-token verified'
        onClick={() => {
          if (address === 'awaited') return;
          handleSend(address, balance, symbol);
        }}
      >
        <div className='balances-token-left'>
          {'zk'}
          {symbol}
        </div>
        <div className='balances-token-right'>
          <div className='balances-token-right container'>
            <div>
              <span>{+balance < 0.000001 ? 0 : +balance.toFixed(6)}</span>{' '}
              {price && (
                <span>
                  {`(~$${+(
                    balance * +(price && !!price[symbol] ? price[symbol] : 1)
                  ).toFixed(2)})`}
                </span>
              )}
              <div className='balances-token-status'>
                <span className='label-done'></span>
              </div>
            </div>
            <div>
              {store.awaitedTokens[symbol]?.amount && (
                <>
                  <span className='awaited-tokens'>
                    {`+ ${store.awaitedTokens[symbol]?.amount /
                      Math.pow(10, 18)}`}
                  </span>
                  {price && (
                    <span className='awaited-tokens'>
                      {`(~$${+(
                        (store.awaitedTokens[symbol]?.amount /
                          Math.pow(10, 18)) *
                        +(price && !!price[symbol] ? price[symbol] : 1)
                      ).toFixed(2)})`}
                    </span>
                  )}
                  <span className='awaited-tokens'>{'depositing'}</span>
                  <SpinnerWorm />
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
        className='balances-token verified'
        onClick={() => {
          if (address === 'awaited') return;
          handleSend(address, balance, symbol);
        }}
      >
        <div className='balances-token-left'>
          {'zk'}
          {symbol}
        </div>
        <div className='balances-token-right'>
          <div className='balances-token-right container'>
            <div>
              <span>{+balance < 0.000001 ? 0 : +balance.toFixed(6)}</span>{' '}
              {price && (
                <span>
                  {`(~$${+(
                    balance * +(price && !!price[symbol] ? price[symbol] : 1)
                  ).toFixed(2)})`}
                </span>
              )}
              <div className='balances-token-status'>
                <span className='label-verifying'></span>
              </div>
            </div>
            <div>
              {store.awaitedTokens[symbol]?.amount && (
                <>
                  <span className='awaited-tokens'>
                    {`+ ${store.awaitedTokens[symbol]?.amount /
                      Math.pow(10, 18)}`}
                  </span>
                  {price && (
                    <span className='awaited-tokens'>
                      {`(~$${+(
                        (store.awaitedTokens[symbol]?.amount /
                          Math.pow(10, 18)) *
                        +(price && !!price[symbol] ? price[symbol] : 1)
                      ).toFixed(2)})`}
                    </span>
                  )}
                  <span className='awaited-tokens'>{'depositing'}</span>
                  <SpinnerWorm />
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

  // const setAwaitingBalance = useCallback((balance: IEthBalance[]) => {
  //   if (Object.keys(store.awaitedTokens).length > 0) {
  //     for(const token in store.awaitedTokens) {
  //       const _list = Object.entries(balance).map(el => el[1].symbol);
  //       if (_list.indexOf(token) === -1) {
  //         console.log('empty')
  //         store.zkBalances = balance.concat([{
  //           symbol: token,
  //           balance: 0,
  //           address: 'awaited'
  //         }]);
  //       store.searchBalances = store.zkBalances;
  //       } else {
  //         store.zkBalances = balance;
  //         console.log('new')

  //       }
  //     }
  //   } else {
  //     store.zkBalances = balance;
  //  }
  // }, [store.awaitedTokens, store.searchBalances]);

  useEffect(() => {
    const { zkWallet, accountState, tokens } = store;
    if (!zkWallet) return;
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
            balance: +zkBalance[key] / Math.pow(10, 18),
            symbol: tokens[key].symbol,
          };
        });
        Promise.all(zkBalancePromises)
          .then(res => {
            if (Object.keys(store.awaitedTokens).length > 0) {
              for (const token in store.awaitedTokens) {
                const _list = Object.entries(res).map(el => el[1].symbol);
                if (_list.indexOf(token) === -1) {
                  store.zkBalances = res.concat([
                    {
                      symbol: token,
                      balance: 0,
                      address: 'awaited',
                    },
                  ]);
                } else {
                  store.zkBalances = res;
                }
              }
            } else {
              store.zkBalances = res;
            }
            if (JSON.stringify(res) !== JSON.stringify(zkBalances)) {
              if (accountState?.id) {
                zkWallet?.isSigningKeySet().then(data => {
                  store.unlocked = data;
                });
              } else {
                store.unlocked = true;
              }
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
    const int = setInterval(getAccState, 3000);

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
      store.transactionType = 'transfer';
      history.push('/send');
      setMaxValueProp(balance);
      setSymbolNameProp(symbol);
      setTokenProp(symbol ? symbol : address);
    },
    [history, setMaxValueProp, setSymbolNameProp, setTokenProp, store],
  );

  useCheckLogin();

  const isVerified = ({ address, symbol, balance }) => {
    return (
      store.verified &&
      (+balance === +store.verified[address] / Math.pow(10, 18) ||
        +balance === +store.verified[symbol] / Math.pow(10, 18))
    );
  };

  const { ethBalances, price, zkBalances, zkBalancesLoaded } = store;
  const ApiFailedHint = () =>
    !store.price && store.zkBalancesLoaded ? (
      <p>{'No Conversion Rate Available'}</p>
    ) : null;

  const Balance = ({ verified, balance }) =>
    verified ? (
      <VerifiedBal handleSend={handleSend} balance={balance} />
    ) : (
      <UnverifiedBal handleSend={handleSend} balance={balance} />
    );

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
        title='Token balances'
        visible={true}
        footer={ApiFailedHint}
        renderItem={balance => (
          <Balance
            key={balance.address}
            verified={isVerified(balance)}
            balance={balance}
          />
        )}
        emptyListComponent={() =>
          zkBalancesLoaded && store.accountState ? (
            <p>{'No balances yet.'}</p>
          ) : (
            <Spinner />
          )
        }
      />
    </>
  );
});

export default Account;
