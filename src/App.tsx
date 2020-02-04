import React, { useEffect } from 'react';

import Header from './components/Header/Header';

import { Modal } from 'antd';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

import { DEFAULT_ERROR } from './constants/errors';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error, setError, zkWallet } = useRootData(({ error, setError, zkWallet }) => ({
    error: error.get(),
    setError,
    zkWallet: zkWallet.get(),
  }));

  useEffect(() => {
    try {
      if (typeof window['web3'] !== undefined) {
        throw Error(
          'MetaMask detected another web3. MetaMask will not work reliably with another web3 extension. This usually happens if you have two MetaMasks installed, or MetaMask and another web3 extension. Please remove one and try again.',
        );
      }
    } catch (err) {
      err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
    }
  }, [setError]);

  return (
    <>
      <Modal visible={!!error} onOk={() => setError('')} onCancel={() => setError('')}>
        {error}
      </Modal>
      {zkWallet?.address() && <Header />}
      <div style={{ maxWidth: 900, margin: '0 auto' }}> {children}</div>
    </>
  );
};

export default App;
