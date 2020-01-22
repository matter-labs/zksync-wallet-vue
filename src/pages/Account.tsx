import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { depositFromETH } from 'zksync';

import { Button, Card, Icon, Input } from 'antd';

import { useRootData } from '../hooks/useRootData';

import { request } from '../functions/Request';

import { BASE_URL, CURRENCY, CONVERT_CURRENCY } from '../constants/CoinBase';

const MOCK_ADDRESS = 'sync:2d5bf7a3ab29f0ff424d738a83f9b0588bc9241e';

const Account: React.FC = (): JSX.Element => {
  const [isDisabled, setDisabled] = useState<boolean>(true);
  const [value, setValue] = useState<string>(localStorage.getItem('walletName') || '');
  const [price, setPrice] = useState<number>(0);

  const { ethId, ethWallet, zkBalance, zkWallet } = useRootData(({ ethId, ethWallet, zkBalance, zkWallet }) => ({
    ethId: ethId.get(),
    ethWallet: ethWallet.get(),
    zkBalance: zkBalance.get(),
    zkWallet: zkWallet.get(),
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

  const depositToZk = useCallback(async () => {
    const depositPriorityOperation = await depositFromETH({
      depositFrom: ethWallet,
      depositTo: zkWallet,
      token: 'ETH',
      amount: ethers.utils.parseEther('0.5'),
    });
    await depositPriorityOperation.awaitReceipt();
  }, [ethWallet, zkWallet]);

  const transfer = useCallback(async () => {
    const transferTransaction = await zkWallet.syncTransfer({
      to: MOCK_ADDRESS,
      token: 'ETH',
      amount: ethers.utils.parseEther('0.5'),
      fee: ethers.utils.parseEther('0.001'),
    });
    await transferTransaction.awaitReceipt();
  }, [zkWallet]);

  const withdraw = useCallback(async () => {
    const withdrawTransaction = await zkWallet.withdrawTo({
      ethAddress: ethId,
      token: 'ETH',
      amount: ethers.utils.parseEther('0.2'),
      fee: ethers.utils.parseEther('0.001'),
    });
    await withdrawTransaction.awaitReceipt();
  }, [ethId, zkWallet]);

  return (
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
      <Button onClick={depositToZk}>Deposit</Button>
      <Button onClick={withdraw}>Withdraw</Button>
      <Button onClick={transfer}>Transfer</Button>
    </Card>
  );
};

export default Account;
