import React from 'react';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3';
import ethers, { Wallet, getDefaultProvider, providers } from 'ethers';

import useWalletInit from 'hooks/useWalletInit';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

const BurnerWallet: React.FC = observer(() => {
  const { connect } = useWalletInit();
  const store = useStore();

  const history = useHistory();

  useMobxEffect(() => {
    try {
      const createAccount = async () => {
        const web3 = new Web3(
          new Web3.providers.HttpProvider(
            'https://rinkeby.infura.io/v3/85d8408593834bf6889554d624be0193',
          ),
        );
        const provider = await getDefaultProvider('rinkeby');
        const randomWallet = await Wallet.createRandom();
        const walletWithProvider = await randomWallet.connect(provider);
        store.provider = web3.currentProvider;
        store.ethWallet = walletWithProvider as ethers.ethers.Signer;
      };
      createAccount();
    } catch (err) {
      store.error =
        err.name && err.message
          ? `${err.name}: ${err.message}. Maybe you don't have Metamask or Coinbase installed in your browser`
          : DEFAULT_ERROR;
      history.push('/');
      store.setBatch({
        walletName: '',
        zkWallet: null,
        provider: null,
      });
    }
  }, []);

  return null;
});

export default BurnerWallet;
