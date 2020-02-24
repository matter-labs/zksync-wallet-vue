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
  const [price, setPrice] = useState<number>(0);
  // const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw' | 'transfer' | undefined>();

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
    if (!ethId) {
      window.location.pathname = '/';
    }
  }, [ethId]);

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
        {!!searchBalances.length
          ? searchBalances.map(({ symbol, balance }) => (
              <div key={balance} className="balances-token">
                <div>zk{symbol}</div>
                <div>
                  {balance} <span>(~${balance * price})</span>
                </div>
              </div>
            ))
          : zkBalances.map(({ symbol, balance }) => (
              <div key={balance} className="balances-token">
                <div>zk{symbol}</div>
                <div>
                  {balance} <span>(~${balance * price})</span>
                </div>
              </div>
            ))}
      </DataList>
    </>
  );
};

export default Account;
