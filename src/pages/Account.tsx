import React, { useCallback, useEffect, useState } from 'react';

import { Card, Icon, Input } from 'antd';

import { useRootData } from '../hooks/useRootData';

import { request } from '../functions/Request';

import { BASE_URL, CURRENCY, CONVERT_CURRENCY } from '../constants/CoinBase';

const Account: React.FC = (): JSX.Element => {
  const [isDisabled, setDisabled] = useState<boolean>(true);
  const [value, setValue] = useState<string>(localStorage.getItem('walletName') || '');
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    request(`${BASE_URL}/${CURRENCY}/?convert=${CONVERT_CURRENCY}`)
      .then((res: any) => {
        setPrice(+res![0]!.price_usd);
      })
      .catch(err => console.error(err));
  }, []);

  const { ethId, zkBalance } = useRootData(({ ethId, zkBalance }) => ({
    ethId: ethId.get(),
    zkBalance: zkBalance.get(),
  }));

  const setWalletName = useCallback(() => {
    if (value && value !== ethId) {
      localStorage.setItem('walletName', value);
    } else {
      setValue(localStorage.getItem('walletName') || ethId);
    }
  }, [ethId, value]);

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
      <span>zkETH &nbsp;</span>
      <span>
        {zkBalance}
        &nbsp;
        {!!price ? price.toFixed(2) : <Icon type="spin" />}
      </span>
    </Card>
  );
};

export default Account;
