import React from 'react';

import Header from './components/Header/Header';
import Modal from './components/Modal/Modal';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error, setError, setModal } = useRootData(({ error, setError, setModal }) => ({
    error: error.get(),
    setError,
    setModal,
  }));

  return (
    <>
      <Modal visible={!!error} classSpecifier="wallet" background={true}>
        {error}
      </Modal>
      <Header />
      <div className="content-wrapper">{children}</div>
    </>
  );
};

export default App;
