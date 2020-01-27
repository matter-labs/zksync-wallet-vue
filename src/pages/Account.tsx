import React, { useCallback, useEffect, useState } from 'react';

import { Button, Card, Icon, Input, Modal } from 'antd';
import Transaction from '../components/Transaction/Transaction';

import { useRootData } from '../hooks/useRootData';
import { useTransaction } from '../hooks/useTransaction';

import { request } from '../functions/Request';

import { BASE_URL, CURRENCY, CONVERT_CURRENCY } from '../constants/CoinBase';

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
    setExecuted,
    setHash,
    withdraw,
  } = useTransaction();
  const [isDepositModalOpen, setDepositModal] = useState<boolean>(false);
  const [isWithrawModalOpen, setWithdrawModal] = useState<boolean>(false);
  const [isDisabled, setDisabled] = useState<boolean>(true);
  const [value, setValue] = useState<string>(localStorage.getItem('walletName') || '');
  const [price, setPrice] = useState<number>(0);

  const { ethId, ethBalance, zkBalance } = useRootData(({ ethId, ethBalance, zkBalance }) => ({
    ethId: ethId.get(),
    ethBalance: ethBalance.get(),
    zkBalance: zkBalance.get(),
  }));

  useEffect(() => {
    request(`${BASE_URL}/${CURRENCY}/?convert=${CONVERT_CURRENCY}`)
      .then((res: any) => {
        setPrice(+res?.[0]?.price_usd);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!ethId) {
      window.location.pathname = '/';
    }
  }, [ethId]);

  const setWalletName = useCallback(() => {
    if (value && value !== ethId) {
      localStorage.setItem('walletName', value);
    } else {
      setValue(localStorage.getItem('walletName') || ethId);
    }
  }, [ethId, value]);

  const handleCancel = useCallback(
    setModal => {
      setModal(false);
      setHash('');
      setExecuted(false);
    },
    [setExecuted, setHash],
  );

  return (
    <>
      <Modal
        title="Deposit"
        visible={isDepositModalOpen}
        onOk={() => handleCancel(setDepositModal)}
        onCancel={() => handleCancel(setDepositModal)}
      >
        <Transaction
          addressValue={addressValue}
          amountValue={amountValue}
          asset="ETH"
          balance={ethBalance}
          hash={hash}
          isExecuted={isExecuted}
          isInput={false}
          isLoading={isLoading}
          onCancel={handleCancel}
          openModal={setDepositModal}
          onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
          onChangeAmount={setAmountValue}
          setExecuted={setExecuted}
          title="Deposit"
          transactionAction={deposit}
        />
      </Modal>
      <Modal
        title="Withdraw"
        visible={isWithrawModalOpen}
        onOk={() => handleCancel(setWithdrawModal)}
        onCancel={() => handleCancel(setWithdrawModal)}
      >
        <Transaction
          addressValue={addressValue}
          amountValue={amountValue}
          asset="ETH"
          balance={zkBalance ? (zkBalance['ETH'] as number) / Math.pow(10, 18) : 0}
          hash={hash}
          isExecuted={isExecuted}
          isInput
          isLoading={isLoading}
          onCancel={handleCancel}
          openModal={setWithdrawModal}
          onChangeAddress={(e: React.ChangeEvent<HTMLInputElement>) => setAddressValue(e.target.value)}
          onChangeAmount={setAmountValue}
          setExecuted={setExecuted}
          title="Withdraw"
          transactionAction={withdraw}
        />
      </Modal>
      <Card bordered={true} style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex' }}>
          <Input
            placeholder={ethId}
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={isDisabled}
            onBlur={setWalletName}
          />
          <Icon type="edit" onClick={() => setDisabled(false)} />
        </div>
        {zkBalance &&
          Object.keys(zkBalance).map(key => (
            <div key={key}>
              <span>zk{key} &nbsp;</span>
              <span>
                {+zkBalance[key] / Math.pow(10, 18)}
                &nbsp;
                {!!price ? price.toFixed(2) : <Icon type="spin" />}
              </span>
            </div>
          ))}
        <br />
        <Button onClick={() => setDepositModal(true)}>Deposit</Button>
        <Button onClick={() => setWithdrawModal(true)}>Withdraw</Button>
      </Card>
    </>
  );
};

export default Account;
