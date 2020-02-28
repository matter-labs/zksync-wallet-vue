import React, { useEffect, useState } from 'react';

import DataList from '../components/DataList/DataList';
import MyWallet from '../components/Wallets/MyWallet';
import Transaction from '../components/Transaction/Transaction';

import { useRootData } from '../hooks/useRootData';
import { useTransaction } from '../hooks/useTransaction';

import { request } from '../functions/Request';

import { BASE_URL, CURRENCY, CONVERT_CURRENCY } from '../constants/CoinBase';
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
    transfer,
    withdraw,
  } = useTransaction();

  const [maxValue, setMaxValue] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [symbolName, setSymbolName] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const {
    error,
    ethId,
    ethBalances,
    setBalances,
    setError,
    searchBalances,
    setTransactionType,
    transactionType,
    zkBalances,
  } = useRootData(
    ({
      error,
      ethId,
      ethBalances,
      setBalances,
      setError,
      searchBalances,
      setTransactionType,
      transactionModal,
      transactionType,
      zkBalances,
    }) => ({
      error: error.get(),
      ethId: ethId.get(),
      ethBalances: ethBalances.get(),
      searchBalances: searchBalances.get(),
      setBalances,
      setError,
      setTransactionType,
      transactionModal: transactionModal.get(),
      transactionType: transactionType.get(),
      zkBalances: zkBalances.get(),
    }),
  );

  useEffect(() => {
    request(`${BASE_URL}/${CURRENCY}/?convert=${CONVERT_CURRENCY}`)
      .then((res: any) => {
        setPrice(+res?.[0]?.price_usd);
      })
      .catch(err => {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
      });
  }, [error, setError, setPrice]);

  useEffect(() => {
    setBalances(zkBalances);
    if (!ethId) {
      window.location.pathname = '/';
    }
  }, [ethId, zkBalances]);

  const handleSend = (address, balance, symbol) => {
    setTransactionType('transfer');
    setMaxValue(balance);
    setSymbolName(symbol);
    setToken(+address ? address : symbol);
  };

  return (
    <>
      {!transactionType && (
        <MyWallet balances={ethBalances} price={price} title="My wallet" setTransactionType={setTransactionType} />
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
          onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
          onChangeAmount={setAmountValue}
          price={price}
          setHash={setHash}
          setExecuted={setExecuted}
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
          onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
          onChangeAmount={setAmountValue}
          price={price}
          setHash={setHash}
          setExecuted={setExecuted}
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
          onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
          onChangeAmount={setAmountValue}
          propsMaxValue={maxValue ? maxValue : 0}
          propsSymbolName={symbolName ? symbolName : ''}
          propsToken={token ? token : ''}
          price={price}
          setHash={setHash}
          setExecuted={setExecuted}
          setTransactionType={setTransactionType}
          title="Send"
          transactionAction={transfer}
          type="sync"
        />
      )}
      <DataList
        setValue={setBalances}
        dataProperty={dataPropertyName}
        data={zkBalances}
        title="Token balances"
        visible={true}
      >
        {!!searchBalances.length ? (
          searchBalances.map(({ address, symbol, balance }) => (
            <div key={balance} className="balances-token">
              <div className="balances-token-left">zk{symbol}</div>
              <div className="balances-token-right">
                {balance} <span>(~${(balance * price).toFixed(2)})</span>
              </div>
              <button onClick={() => handleSend(address, balance, symbol)}>Send</button>
            </div>
          ))
        ) : (
          <div></div>
        )}
      </DataList>
    </>
  );
};

export default Account;
