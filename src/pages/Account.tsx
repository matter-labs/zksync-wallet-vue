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
  const {
    addressValue,
    amountValue,
    hash,
    isExecuted,
    isLoading,
    setAddressValue,
    setAmountValue,
    setExecuted,
  } = useTransaction();
  const [price, setPrice] = useState<number>(0);

  const { error, ethId, ethBalances, setError, searchBalances, transactionModal, zkBalances } = useRootData(
    ({ error, ethId, ethBalances, setError, searchBalances, transactionModal, zkBalances }) => ({
      error: error.get(),
      ethId: ethId.get(),
      ethBalances: ethBalances.get(),
      searchBalances: searchBalances.get(),
      setError,
      transactionModal: transactionModal.get(),
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
      <MyWallet balances={ethBalances} price={price} title="My wallet" />
      {transactionModal?.title.length && (
        <Transaction
          addressValue={addressValue}
          amountValue={amountValue}
          balances={ethBalances}
          hash={hash}
          isExecuted={isExecuted}
          isInput={transactionModal.input}
          isLoading={isLoading}
          onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
          onChangeAmount={setAmountValue}
          price={price}
          setExecuted={setExecuted}
          title={transactionModal.title}
          transactionAction={transactionModal.action}
          zkBalances={zkBalances}
        />
      )}
      <DataList title="Token balances" visible={!transactionModal || transactionModal.title === 'Send' ? true : false}>
        {!!searchBalances &&
          searchBalances.map(({ symbol, balance }) => (
            <div className="balances-token">
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
