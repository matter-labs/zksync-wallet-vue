import React, { useEffect } from 'react';

import Transaction from '../components/Transaction/Transaction';

import { useRootData } from '../hooks/useRootData';
import { useTransaction } from '../hooks/useTransaction';

const Send: React.FC = (): JSX.Element => {
  const {
    addressValue,
    amountValue,
    hash,
    isExecuted,
    isLoading,
    setAddressValue,
    setAmountValue,
    setExecuted,
    transfer,
  } = useTransaction();

  const { ethId, zkBalance } = useRootData(({ ethId, zkBalance }) => ({
    zkBalance: zkBalance.get(),
    ethId: ethId.get(),
  }));

  useEffect(() => {
    if (!ethId) {
      window.location.pathname = '/';
    }
  }, [ethId]);
  return (
    <Transaction
      addressValue={addressValue}
      amountValue={amountValue}
      asset="ETH"
      balance={zkBalance ? (zkBalance['ETH'] as number) / Math.pow(10, 18) : 0}
      hash={hash}
      isExecuted={isExecuted}
      isInput
      isLoading={isLoading}
      onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
      onChangeAmount={setAmountValue}
      setExecuted={setExecuted}
      title="Transfer"
      transactionAction={transfer}
    />
  );
};

export default Send;
