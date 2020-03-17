import React, { useEffect, useState } from 'react';

import DataList from '../components/DataList/DataList';
import MyWallet from '../components/Wallets/MyWallet';
import SpinnerWorm from '../components/Spinner/SpinnerWorm';
import Transaction from '../components/Transaction/Transaction';

import { useRootData } from '../hooks/useRootData';
import { useTransaction } from '../hooks/useTransaction';

import { request } from '../functions/Request';

import { BASE_URL } from '../constants/CoinBase';
import { DEFAULT_ERROR } from '../constants/errors';

const Account: React.FC = (): JSX.Element => {
  const dataPropertyName = 'symbol';

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
    setBalances,
    setError,
    searchBalances,
    setPrice,
    setTransactionType,
    transactionType,
    verifyToken,
    zkBalances,
    zkWallet,
  } = useRootData(
    ({
      error,
      ethId,
      ethBalances,
      price,
      setBalances,
      setError,
      searchBalances,
      setPrice,
      setTransactionType,
      transactionModal,
      transactionType,
      verifyToken,
      zkBalances,
      zkWallet,
    }) => ({
      error: error.get(),
      ethId: ethId.get(),
      ethBalances: ethBalances.get(),
      price: price.get(),
      searchBalances: searchBalances.get(),
      setBalances,
      setError,
      setPrice,
      setTransactionType,
      transactionModal: transactionModal.get(),
      transactionType: transactionType.get(),
      verifyToken: verifyToken.get(),
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  useEffect(() => {
    setBalances(zkBalances);
    zkWallet
      ?.getAccountState()
      .then(res => res)
      .then(data => setVerified(data.verified.balances));
    if (!ethId) {
      window.location.pathname = '/';
    }
    const balancesSymbols = () => {
      const exceptFau = zkBalances?.filter(el => el.symbol !== 'FAU').map(el => el.symbol);
      return exceptFau;
    };
    // if (balancesSymbols().toString()) {
    //   request(
    //     `https://cors-anywhere.herokuapp.com/${BASE_URL}?symbol=${
    //       balancesSymbols().toString() ? balancesSymbols().toString() : 'ETH'
    //     }`,
    //     {
    //       method: 'GET',
    //       headers: {
    //         'X-CMC_PRO_API_KEY': '6497b92f-601e-4765-86e3-cd11e41a21f8',
    //       },
    //     },
    //   )
    //     .then((res: any) => {
    //       const prices = {};
    //       Object.keys(res.data).map(el => (prices[el] = res.data[el].quote.USD.price));
    //       setPrice(prices);
    //     })
    //     .catch(err => {
    //       err.name && err.message ? setError(`${err.name}: ${err.message}`) : setError(DEFAULT_ERROR);
    //     });
    // }
  }, [error, ethId, setBalances, setError, setPrice, verifyToken, zkBalances, zkWallet]);

  const handleSend = (address, balance, symbol) => {
    setTransactionType('transfer');
    setMaxValue(balance);
    setSymbolName(symbol);
    setToken(symbol ? symbol : address);
  };

  return (
    <>
      {!transactionType && (
        <>
          <MyWallet balances={ethBalances} price={price} title="My wallet" setTransactionType={setTransactionType} />
          <DataList
            setValue={setBalances}
            dataProperty={dataPropertyName}
            data={zkBalances}
            title="Token balances"
            visible={true}
          >
            {!!searchBalances.length ? (
              searchBalances.map(({ address, symbol, balance }) => (
                <>
                  {verified &&
                  (+balance === +verified[address] / Math.pow(10, 18) ||
                    +balance === +verified[symbol] / Math.pow(10, 18)) ? (
                    <div key={balance} className="balances-token verified">
                      <div className="balances-token-left">zk{symbol}</div>
                      <div className="balances-token-right">
                        <p>{+balance.toFixed(2)}</p>{' '}
                        <span>(~${+(balance * +(price && !!price[symbol] ? price[symbol] : 1)).toFixed()})</span>
                        <div>
                          <p>Verified</p> <span className="label-done"></span>
                        </div>
                      </div>
                      <button onClick={() => handleSend(address, balance, symbol)}>Send</button>
                    </div>
                  ) : (
                    <div key={balance} className="balances-token pending">
                      <div className="balances-token-left">zk{symbol}</div>
                      <div className="balances-token-right">
                        <p>{+balance.toFixed(2)}</p>{' '}
                        <span>(~${+(balance * +(price && !!price[symbol] ? price[symbol] : 1)).toFixed()})</span>
                        <div>
                          <p>Pending</p> <SpinnerWorm />
                        </div>
                      </div>
                      <button className="pending" onClick={() => undefined}>
                        Send
                      </button>
                    </div>
                  )}
                </>
              ))
            ) : (
              <div></div>
            )}
          </DataList>
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
          setTransactionType={setTransactionType}
          title="Deposit"
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
          title="Withdraw"
          transactionAction={withdraw}
          type="eth"
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
          setTransactionType={setTransactionType}
          title="Send"
          transactionAction={transfer}
          type="sync"
        />
      )}
    </>
  );
};

export default Account;
