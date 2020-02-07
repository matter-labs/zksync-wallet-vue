import React from 'react';

import Header from './components/Header/Header';

import { Modal } from 'antd';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error, setError, zkWallet } = useRootData(({ error, setError, zkWallet }) => ({
    error: error.get(),
    setError,
    zkWallet: zkWallet.get(),
  }));

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
