import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';
import Spinner from 'src/components/Spinner/Spinner';
import sendIcon from 'images/send.svg';

import { IEthBalance } from 'types/Common';

import { useTransaction } from 'hooks/useTransaction';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useStore } from 'src/store/context';

import { DEFAULT_ERROR } from 'constants/errors';

interface BalProps {
  balance: IEthBalance;
  handleSend: (address: any, balance: any, symbol: any) => void;
}

// const sendIcon = () => (
//   <svg
//     width='25'
//     height='25'
//     viewBox='0 0 25 25'
//     fill='none'
//     xmlns='http://www.w3.org/2000/svg'
//   >
//     <path
//       d='M21.3164 12.2275L3.98014 3.53456C3.90967 3.49932 3.82885 3.49103 3.75216 3.50969C3.576 3.55321 3.46616 3.73147 3.50968 3.90972L5.29616 11.2098C5.3231 11.3197 5.40393 11.4088 5.51169 11.444L8.57274 12.4949L5.51377 13.5458C5.406 13.5831 5.32517 13.6701 5.3003 13.78L3.50968 21.0904C3.49103 21.1671 3.49932 21.248 3.53455 21.3164C3.61538 21.4801 3.81434 21.5464 3.98014 21.4656L21.3164 12.8224C21.3806 12.7913 21.4324 12.7374 21.4656 12.6752C21.5464 12.5094 21.4801 12.3104 21.3164 12.2275ZM5.55314 19.0136L6.5956 14.7521L12.7135 12.6524C12.7612 12.6358 12.8006 12.5985 12.8172 12.5488C12.8462 12.4617 12.8006 12.3685 12.7135 12.3374L6.5956 10.2398L5.55729 5.99487L18.5724 12.5218L5.55314 19.0136Z'
//       fill='#8c8dfc'
//     />
//   </svg>
// );

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
        <div className='balances-token-left'>{symbol}</div>
        <div className='balances-token-right'>
          <div className='balances-token-right container'>
            <div className='current-tokens'>
              <span>{+balance < 0.0000000001 ? 0 : +balance.toFixed(10)}</span>{' '}
              {price && (
                <span className='token-price'>
                  {`~$${+(
                    balance * +(price && !!price[symbol] ? price[symbol] : 1)
                  ).toFixed(2)}`}
                </span>
              )}
              <div className='send-icon wallet'>
                <img src={sendIcon} alt='send' />
              </div>
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
                  <SpinnerWorm title='Verification in progress' />
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
        <div className='balances-token-left'>{symbol}</div>
        <div className='balances-token-right'>
          <div className='balances-token-right container'>
            <div className='current-tokens'>
              <span>{+balance < 0.0000000001 ? 0 : +balance.toFixed(10)}</span>{' '}
              {price && (
                <span className='token-price'>
                  {`~$${+(
                    balance * +(price && !!price[symbol] ? price[symbol] : 1)
                  ).toFixed(2)}`}
                </span>
              )}
              <div className='send-icon wallet'>
                <img src={sendIcon} alt='send' />
              </div>
              <div className='balances-token-status'>
                <span className='label-verifying'>
                  <span className='tooltip wide'>
                    {'Verification in progress'}
                  </span>
                </span>
              </div>
            </div>
            <div className='awaited-tokens-block'>
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
                  <SpinnerWorm title='Verification in progress' />
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
  const { zkWallet, accountState, tokens } = store;

  const getAccState = useCallback(
    async (extended: boolean) => {
      if (zkWallet && tokens) {
        const _accountState = await zkWallet.getAccountState();
        if (JSON.stringify(accountState) !== JSON.stringify(_accountState)) {
          store.accountState = _accountState;
        }
        const at = _accountState.depositing.balances;
        store.awaitedTokens = at;
        if (extended) {
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
                    if (
                      JSON.stringify(store.zkBalances) !== JSON.stringify(res)
                    )
                      store.zkBalances = res;
                  }
                }
              } else {
                if (JSON.stringify(store.zkBalances) !== JSON.stringify(res))
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
      }
      if (
        JSON.stringify(accountState?.verified.balances) !==
        JSON.stringify(store.verified)
      ) {
        store.verified = accountState?.verified.balances;
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
    ],
  );

  const getVerified = async () => {
    if (zkWallet) {
      store.verified = await (await zkWallet.getAccountState()).verified
        .balances;
    }
  };

  useEffect(() => {
    getAccState(true);
    getVerified();
  }, []);

  // useEffect(() => {
  //   if (!zkWallet) return;

  //   const int = setInterval(() => getAccState(true), 3000);

  //   return () => {
  //     clearInterval(int);
  //   };
  // }, [
  //   store,
  //   store.zkWallet,
  //   store.accountState,
  //   store.awaitedTokens,
  //   store.tokens,
  //   store.zkBalances,
  //   store.searchBalances,
  //   store.verified,
  // ]);

  const handleSend = useCallback(
    (address, balance, symbol) => {
      store.transactionType = 'transfer';
      history.push('/send');
      store.propsMaxValue = balance;
      store.propsSymbolName = symbol;
      store.propsToken = symbol ? symbol : address;
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
