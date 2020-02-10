import React from 'react';

import Header from './components/Header/Header';

import { Modal } from 'antd';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error, setError } = useRootData(({ error, setError }) => ({
    error: error.get(),
    setError,
  }));

  return (
    <>
      <Modal visible={!!error} onOk={() => setError('')} onCancel={() => setError('')}>
        {error}
      </Modal>
      <Header />
      <div className="content-wrapper"> {children}</div>
    </>
  );
};

export default App;
