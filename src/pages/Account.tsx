import React, { useEffect, useState } from 'react';

import { DataList } from 'components/DataList/DataListNew';
import MyWallet from 'components/Wallets/MyWallet';
import SpinnerWorm from 'components/Spinner/SpinnerWorm';
import Transaction from 'components/Transaction/Transaction';

import { useRootData } from 'hooks/useRootData';
import { useTransaction } from 'hooks/useTransaction';

import { BASE_URL } from 'constants/CoinBase';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useHistory } from 'react-router-dom';
import { useCancelable } from 'hooks/useCancelable';

const Account: React.FC = (): JSX.Element => {
  const {
    addressValue,
    amountValue,
    deposit,
    hash,
    isExecuted,
    isLoading,
    setAddressValue,
    setAmountValue,
    setHash,
    setExecuted,
    setLoading,
    setSymbol,
    transfer,
    withdraw,
  } = useTransaction();

  const [maxValue, setMaxValue] = useState<number>(0);
  const [symbolName, setSymbolName] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [verified, setVerified] = useState<any>();

  const {
    error,
    ethId,
    ethBalances,
    price,
    provider,
    setBalances,
    setError,
    searchBalances,
    setPrice,
    setTransactionType,
    setUnlocked,
    transactionType,
    verifyToken,
    walletName,
    zkBalances,
    zkWallet,
  } = useRootData(
    ({
      error,
      ethId,
      ethBalances,
      price,
      provider,
      setBalances,
      setError,
      searchBalances,
      setPrice,
      setTransactionType,
      setUnlocked,
      transactionModal,
      transactionType,
      verifyToken,
      walletName,
      zkBalances,
      zkWallet,
    }) => ({
      error: error.get(),
      ethId: ethId.get(),
      ethBalances: ethBalances.get(),
      provider: provider.get(),
      price: price.get(),
      searchBalances: searchBalances.get(),
      setBalances,
      setError,
      setPrice,
      setTransactionType,
      setUnlocked,
      transactionModal: transactionModal.get(),
      transactionType: transactionType.get(),
      verifyToken: verifyToken.get(),
      walletName: walletName.get(),
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const cancelable = useCancelable();

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
        `https://kraftwerk28.pp.ua/cors/${BASE_URL}?symbol=${
          balancesSymbols().toString() ? balancesSymbols().toString() : 'ETH'
        }`,
      ),
    )
      .then((res: any) => {
        const prices = {};
        Object.keys(res.data).map(
          el => (prices[el] = res.data[el].quote.USD.price),
        );
        setPrice(prices);
      })
      .catch(err => {
        // err.name && err.message ? setError(`${err.name}: ${err.message}`) : setError(DEFAULT_ERROR);
        console.log(err);
      });
  };
  useEffect(() => {
    cancelable(initWallet);
    cancelable(zkWallet?.getAccountState()).then(res => {
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

  const handleSend = (address, balance, symbol) => {
    setTransactionType('transfer');
    setMaxValue(balance);
    setSymbolName(symbol);
    setToken(symbol ? symbol : address);
  };

  useCheckLogin();

  const isVerified = ({ address, symbol, balance }) =>
    verified &&
    (+balance === +verified[address] / Math.pow(10, 18) ||
      +balance === +verified[symbol] / Math.pow(10, 18));

  const ApiFailedHint = () => (
    <>
      {(price && !price.length) || !price ? (
        <p>No Conversion Rate Available</p>
      ) : (
        <></>
      )}
    </>
  );

  const VerifiedBal = ({ balance: { address, symbol, balance } }) => (
    <div key={balance} className='balances-token verified'>
      <div className='balances-token-left'>
        {'zk'}
        {symbol}
      </div>
      <div className='balances-token-right'>
        <p>{+balance.toFixed(6)}</p>{' '}
        <span>
          {price && !!price.length ? (
            <>
              (~$
              {
                +(
                  balance * +(price && !!price[symbol] ? price[symbol] : 1)
                ).toFixed(2)
              }
              )
            </>
          ) : (
            <></>
          )}
        </span>
        <div className='balances-token-status'>
          <p>Verified</p> <span className='label-done'></span>
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

  const UnverifiedBal = ({ balance: { symbol, balance } }) => (
    <div key={balance} className='balances-token pending'>
      <div className='balances-token-left'>zk{symbol}</div>
      <div className='balances-token-right'>
        <p>{+balance.toFixed(6)}</p>{' '}
        <span>
          {price && !!price.length ? (
            <>
              (~$
              {
                +(
                  balance * +(price && !!price[symbol] ? price[symbol] : 1)
                ).toFixed(2)
              }
              )
            </>
          ) : (
            <></>
          )}
        </span>
        <div className='balances-token-status'>
          <p>Pending</p>
          <SpinnerWorm />
        </div>
        <button className='pending btn-tr' onClick={() => undefined}>
          Send
        </button>
      </div>
    </div>
  );

  return (
    <>
      {!transactionType && (
        <>
          <MyWallet
            balances={ethBalances}
            price={price}
            title='My wallet'
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
      )}
      {transactionType === 'deposit' && (
        <Transaction
          addressValue={addressValue}
          amountValue={amountValue}
          balances={ethBalances}
          hash={hash}
          isExecuted={isExecuted}
          isInput={false}
          isLoading={isLoading}
          onChangeAddress={(e: string) => setAddressValue(e)}
          onChangeAmount={setAmountValue}
          price={price}
          setHash={setHash}
          setExecuted={setExecuted}
          setLoading={setLoading}
          setSymbol={setSymbol}
          setTransactionType={setTransactionType}
          title='Deposit'
          transactionAction={deposit}
        />
      )}
      {transactionType === 'withdraw' && (
        <Transaction
          addressValue={addressValue}
          amountValue={amountValue}
          balances={zkBalances}
          hash={hash}
          isExecuted={isExecuted}
          isInput={true}
          isLoading={isLoading}
          onChangeAddress={(e: string) => setAddressValue(e)}
          onChangeAmount={setAmountValue}
          price={price}
          setHash={setHash}
          setExecuted={setExecuted}
          setLoading={setLoading}
          setTransactionType={setTransactionType}
          setSymbol={setSymbol}
          title='Withdraw'
          transactionAction={withdraw}
          type='eth'
        />
      )}
      {transactionType === 'transfer' && (
        <Transaction
          addressValue={addressValue}
          amountValue={amountValue}
          balances={zkBalances}
          hash={hash}
          isExecuted={isExecuted}
          isInput={true}
          isLoading={isLoading}
          onChangeAddress={(e: string) => setAddressValue(e)}
          onChangeAmount={setAmountValue}
          propsMaxValue={maxValue ? maxValue : 0}
          propsSymbolName={symbolName ? symbolName : ''}
          propsToken={token ? token : ''}
          price={price}
          setHash={setHash}
          setExecuted={setExecuted}
          setLoading={setLoading}
          setSymbol={setSymbol}
          setTransactionType={setTransactionType}
          title='Send'
          transactionAction={transfer}
          type='sync'
        />
      )}
    </>
  );
};

export default Account;
