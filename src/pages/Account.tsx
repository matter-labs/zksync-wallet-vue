import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useHistory } from 'react-router-dom';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';

import { useRootData } from 'hooks/useRootData';
import { useTransaction } from 'hooks/useTransaction';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useCancelable } from 'hooks/useCancelable';
import { loadTokens } from 'src/utils';
import Spinner from 'src/components/Spinner/Spinner';

function useInterval(callback, delay) {
  const savedCallback = useRef(() => undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (typeof savedCallback.current === 'function') savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Account: React.FC = (): JSX.Element => {
  const {
    setMaxValueProp,
    setSymbolNameProp,
    setTokenProp,
    maxValueProp,
  } = useTransaction();

  const history = useHistory();

  const {
    ethBalances,
    price,
    setBalances,
    setTransactionType,
    setUnlocked,
    zkBalances,
    zkWallet,
    syncProvider,
    syncWallet,
    setTokens,
    setEthBalances,
    setZkBalances,
    setVerified,
    verified,
    tokens,
    zkBalancesLoaded,
    unlocked,
    accountState,
  } = useRootData(
    ({
      error,
      ethId,
      ethBalances,
      price,
      provider,
      transactionModal,
      transactionType,
      tokens,
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
      tokens: tokens.get(),
      transactionModal: transactionModal.get(),
      transactionType: transactionType.get(),
      verifyToken: verifyToken.get(),
      walletName: walletName.get(),
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
      syncProvider: s.syncProvider.get(),
      syncWallet: s.syncWallet.get(),
      verified: s.verified.get(),
      unlocked: s.unlocked.get(),
      zkBalancesLoaded: zkBalancesLoaded.get(),
      accountState: s.accountState.get(),
    }),
  );

  const cancelable = useCancelable();
  const [refreshTimer, setRefreshTimer] = useState<number | null>(null);

  const refreshBalances = useCallback(async () => {
    if (zkWallet) {
      await cancelable(loadTokens(syncProvider, syncWallet, accountState)).then(
        async res => {
          if (JSON.stringify(zkBalances) !== JSON.stringify(res.zkBalances)) {
            setZkBalances(res.zkBalances);
            await cancelable(zkWallet?.getAccountState()).then((res: any) => {
              setVerified(res?.verified.balances);
              res?.id
                ? cancelable(zkWallet?.isSigningKeySet()).then(data =>
                    setUnlocked(data),
                  )
                : setUnlocked(true);
            });
            setBalances(zkBalances);
          }
          if (JSON.stringify(tokens) !== JSON.stringify(res.tokens)) {
            setTokens(res.tokens);
          }
        },
      );
    }
    const timeout = setTimeout(refreshBalances, 2000);
    setRefreshTimer(timeout as any);
  }, [
    zkWallet,
    cancelable,
    syncProvider,
    syncWallet,
    zkBalances,
    accountState,
    tokens,
    setZkBalances,
    setBalances,
    setVerified,
    setTokens,
    setUnlocked,
  ]);

  useEffect(() => {
    if (refreshTimer == null) {
      refreshBalances();
    }
    cancelable(zkWallet?.getAccountState()).then((res: any) => {
      setVerified(res?.verified.balances);
      res?.id
        ? cancelable(zkWallet?.isSigningKeySet()).then(data =>
            setUnlocked(data),
          )
        : setUnlocked(true);
    });
  }, [refreshBalances, refreshTimer, zkBalances]);

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

  const isVerified = ({ address, symbol, balance }) => {
    return (
      verified &&
      (+balance === +verified[address] / Math.pow(10, 18) ||
        +balance === +verified[symbol] / Math.pow(10, 18))
    );
  };

  const ApiFailedHint = () =>
    !price && zkBalancesLoaded ? <p>{'No Conversion Rate Available'}</p> : null;

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
        emptyListComponent={() =>
          zkBalancesLoaded ? <p>{'No balances yet.'}</p> : <Spinner />
        }
      />
    </>
  );
};

export default Account;
