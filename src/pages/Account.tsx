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

const Account: React.FC = observer(() => {
  const { setMaxValueProp, setSymbolNameProp, setTokenProp } = useTransaction();

  const history = useHistory();
  const store = useStore();

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
            if (JSON.stringify(res) !== JSON.stringify(zkBalances)) {
              store.zkBalances = res as IEthBalance[];
              store.searchBalances = res;

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
    const int = setInterval(getAccState, 2000);

    return () => {
      clearInterval(int);
    };
  }, [
    store,
    store.zkWallet,
    store.accountState,
    store.awaitedTokens,
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

  const VerifiedBal = ({ balance: { address, symbol, balance } }) => (
    <div key={balance} className='balances-token verified'>
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
          </div>
          <div>
            <span className='awaited-tokens'>
              {store.awaitedTokens[symbol]?.amount
                ? `+ ${store.awaitedTokens[symbol]?.amount / Math.pow(10, 18)}`
                : ''}
            </span>
          </div>
        </div>
        <div className='balances-token-status'>
          <p>{'Verified'}</p>
          <span className='label-done'></span>
        </div>
        <button
          className='btn-tr'
          onClick={() => handleSend(address, balance, symbol)}
        >
          {'Send'}
        </button>
      </div>
    </div>
  );

  const UnverifiedBal = ({ balance: { address, symbol, balance } }) => (
    <div key={balance} className='balances-token pending'>
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
          </div>
          <div>
            <span className='awaited-tokens'>
              {store.awaitedTokens[symbol]?.amount
                ? `+ ${store.awaitedTokens[symbol]?.amount / Math.pow(10, 18)}`
                : ''}
            </span>
          </div>
        </div>
        <div className='balances-token-status'>
          <p>{'Verifying'}</p>
          <SpinnerWorm />
        </div>
        <button
          onClick={() => handleSend(address, balance, symbol)}
          className='pending btn-tr'
        >
          {'Send'}
        </button>
      </div>
    </div>
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
        renderItem={balance =>
          isVerified(balance) ? (
            <VerifiedBal key={balance.address} balance={balance} />
          ) : (
            <UnverifiedBal key={balance.address} balance={balance} />
          )
        }
        emptyListComponent={() =>
          zkBalancesLoaded ? <p>{'No balances yet.'}</p> : <Spinner />
        }
      />
    </>
  );
});

export default Account;
