import React, { useEffect } from 'react';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Modal from './components/Modal/Modal';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error, provider, setError, walletName } = useRootData(({ error, provider, setError, walletName }) => ({
    error: error.get(),
    provider: provider.get(),
    setError,
    walletName: walletName.get(),
  }));

  return (
    <>
      <div className={`content-wrapper ${walletName ? '' : 'start-page'}`}>
        <Modal cancelAction={() => setError('')} visible={!!error} classSpecifier="error" background={true}>
          <p>{error}</p>
        </Modal>
        {walletName && <Header />}
        <div className="content">{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default App;
