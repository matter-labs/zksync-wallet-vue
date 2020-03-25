import React, { useEffect } from 'react';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Modal from './components/Modal/Modal';

import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

import { RIGHT_NETWORK_ID, RIGHT_NETWORK_NAME } from './constants/networks';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { error, provider, setError, walletName, zkWallet } = useRootData(
    ({ error, provider, setError, walletName, zkWallet }) => ({
      error: error.get(),
      provider: provider.get(),
      setError,
      walletName: walletName.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  useEffect(() => {
    if (provider) {
      window['ethereum'].autoRefreshOnNetworkChange = false;
    }
    if (provider) {
      provider.on('networkChanged', () => {
        provider.networkVersion !== RIGHT_NETWORK_ID && walletName === 'Metamask'
          ? setError(`Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`)
          : setError('');
      });
    }
  }, [provider, setError, walletName, zkWallet]);

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
