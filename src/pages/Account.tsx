import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';

import { useRootData } from 'hooks/useRootData';
import { useTransaction } from 'hooks/useTransaction';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useCancelable } from 'hooks/useCancelable';
import { useInterval } from 'src/hooks/timers';
import { loadTokens } from 'src/utils';

const Account: React.FC = (): JSX.Element => {
  const { setMaxValueProp, setSymbolNameProp, setTokenProp } = useTransaction();

  const [verified, setVerified] = useState<any>();

  const history = useHistory();

  const {
    error,
    ethId,
    ethBalances,
    price,
    provider,
    setBalances,
    setError,
    setPrice,
    setTransactionType,
    setUnlocked,
    verifyToken,
    walletName,
    zkBalances,
    zkWallet,
    syncProvider,
    syncWallet,
    setTokens,
    setEthBalances,
    setZkBalances,
    setZkBalancesLoaded,
    zkBalancesLoaded,
  } = useRootData(
    ({
      error,
      ethId,
      ethBalances,
      price,
      provider,
      transactionModal,
      transactionType,
      verifyToken,
      walletName,
      zkBalances,
      zkWallet,
      searchBalances,
      zkBalancesLoaded,
      ...s
    }) => ({
      ...s,
      error: error.get(),
      ethId: ethId.get(),
      ethBalances: ethBalances.get(),
      provider: provider.get(),
      price: price.get(),
      searchBalances: searchBalances.get(),
      transactionModal: transactionModal.get(),
      transactionType: transactionType.get(),
      verifyToken: verifyToken.get(),
      walletName: walletName.get(),
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
      syncProvider: s.syncProvider.get(),
      syncWallet: s.syncWallet.get(),
      zkBalancesLoaded: zkBalancesLoaded.get(),
    }),
  );

  const cancelable = useCancelable();

  const refreshBalances = useCallback(() => {
    cancelable(loadTokens(syncProvider, syncWallet)).then(res => {
      setTokens(res.tokens);
      setEthBalances(res.ethBalances);
      setZkBalances(res.zkBalances);
    });
  }, [
    cancelable,
    setEthBalances,
    setTokens,
    setZkBalances,
    syncProvider,
    syncWallet,
  ]);
  useInterval(refreshBalances, 2000, [syncProvider, syncWallet]);

  const initWallet = async () => {
    setBalances(zkBalances);
    const balancesSymbols = () => {
      const exceptFau = zkBalances
        ?.filter(el => el.symbol !== 'FAU')
        .map(el => el.symbol);
      return exceptFau;
    };
    cancelable(
      fetch(
        'https://ticker-nhq6ta45ia-ez.a.run.app/cryptocurrency/listings/latest',
        {
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
        },
      ),
    )
      .then((res: any) => res.json())
      .then(data => {
        const prices = {};
        Object.keys(data.data).map(
          el => (prices[data.data[el].symbol] = data.data[el].quote.USD.price),
        );
        setPrice(prices);
      })
      .catch(err => {
        console.error(err);
      });
  };
  useEffect(() => {
    cancelable(initWallet);
    cancelable(zkWallet?.getAccountState()).then((res: any) => {
      setVerified(res?.verified.balances);
      res?.id
        ? cancelable(zkWallet?.isSigningKeySet()).then(data =>
            setUnlocked(data),
          )
        : setUnlocked(true);
    });
  }, [
    error,
    ethId,
    provider,
    setBalances,
    setError,
    setPrice,
    verifyToken,
    walletName,
    zkBalances,
    zkWallet,
  ]);

  const handleSend = useCallback(
    (address, balance, symbol) => {
      setTransactionType('transfer');
      history.push('/send');
      setMaxValueProp(balance);
      setSymbolNameProp(symbol);
      setTokenProp(symbol ? symbol : address);
    },
    [
      history,
      setMaxValueProp,
      setSymbolNameProp,
      setTokenProp,
      setTransactionType,
    ],
  );

  useCheckLogin();

  const isVerified = ({ address, symbol, balance }) =>
    verified &&
    (+balance === +verified[address] / Math.pow(10, 18) ||
      +balance === +verified[symbol] / Math.pow(10, 18));

  const ApiFailedHint = () =>
    !price ? <p>{'No Conversion Rate Available'}</p> : null;

  const VerifiedBal = ({ balance: { address, symbol, balance } }) => {
    return (
      <div key={balance} className='balances-token verified'>
        <div className='balances-token-left'>
          {'zk'}
          {symbol}
        </div>
        <div className='balances-token-right'>
          <p>{+balance < 0.000001 ? 0 : +balance.toFixed(6)}</p>{' '}
          {price && (
            <span>
              {`(~$${+(
                balance * +(price && !!price[symbol] ? price[symbol] : 1)
              ).toFixed(2)})`}
            </span>
          )}
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
  };

  const UnverifiedBal = ({ balance: { address, symbol, balance } }) => (
    <div key={balance} className='balances-token pending'>
      <div className='balances-token-left'>
        {'zk'}
        {symbol}
      </div>
      <div className='balances-token-right'>
        <p>{+balance < 0.000001 ? 0 : +balance.toFixed(6)}</p>{' '}
        {price?.length && (
          <span>{`(~$${+(
            balance * +(price && !!price[symbol] ? price[symbol] : 1)
          ).toFixed(2)})`}</span>
        )}
        <div className='balances-token-status'>
          <p>{'Pending'}</p>
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
        setTransactionType={setTransactionType}
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
        emptyListComponent={() => <p>{'No balances yet.'}</p>}
      />
    </>
  );
};

export default Account;
