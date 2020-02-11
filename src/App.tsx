import React from 'react';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Modal from './components/Modal/Modal';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error } = useRootData(({ error }) => ({
    error: error.get(),
  }));

  return (
    <>
      <div className="content-wrapper">
        <Modal visible={!!error} classSpecifier="error" background={true}>
          {error}
        </Modal>
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
};

export default App;
