import React, { useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';

import Modal from '../Modal/Modal';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';

import './Header.scss';

const Header: React.FC = (): JSX.Element => {
  const { ethId, setAccessModal, setModal, setProvider, setWalletName, setZkWallet, zkWallet } = useRootData(
    ({ ethId, setAccessModal, setModal, setProvider, setWalletName, setZkWallet, zkWallet }) => ({
      ethId: ethId.get(),
      setAccessModal,
      setModal,
      setProvider,
      setWalletName,
      setZkWallet,
      zkWallet: zkWallet.get(),
    }),
  );

  const history = useHistory();

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    address => {
      inputRef.map(el => {
        if (address === el?.value) {
          el?.focus();
          el?.select();
          document.execCommand('copy');
        }
      });
    },
    [inputRef],
  );

  const handleLogOut = useCallback(() => {
    setProvider(null);
    setWalletName('');
    setAccessModal(false);
    setZkWallet(null);
    history.push('/');
  }, [history, setAccessModal, setProvider, setWalletName, setZkWallet]);

  return (
    <div className="menu-wrapper">
      <div className="menu-top">
        <Link className="menu-logo" to="/"></Link>
        {zkWallet?.address() && (
          <>
            <button type="button" className="menu-wallet" onClick={() => setModal('wallet')}>
              <p>{ethId}</p>
              <img src="../../images/randomImage.png" alt="wallet" />
            </button>
            <Modal visible={false} background={true} classSpecifier="wallet">
              <div className="wallet-title">
                {zkWallet?.address().replace(zkWallet?.address().slice(6, zkWallet?.address().length - 3), '...')}
              </div>
              <div className="copy-block">
                <input
                  onChange={() => console.log(null)}
                  className="copy-block-input"
                  value={zkWallet?.address()}
                  ref={e => inputRef.push(e)}
                />
                <p>{zkWallet.address()}</p>
                <button className="copy-block-button" onClick={() => handleCopy(zkWallet.address())}></button>
              </div>
              <div className="horizontal-line"></div>
              <div className="wallet-buttons">
                <button>
                  <span className="icon-qr"></span>Show QR code
                </button>
                <div className="horizontal-line"></div>
                <button>
                  <span className="icon-edit"></span>Rename wallet
                </button>
                <div className="horizontal-line"></div>
                <button onClick={() => handleLogOut()}>
                  <span className="icon-disconnect"></span>Disconnect wallet
                </button>
                <div className="horizontal-line"></div>
              </div>
            </Modal>
          </>
        )}
      </div>
      <div className="menu-routes">
        {zkWallet?.address() &&
          HEADER_ITEMS.map(({ title, link }) => (
            <div className="menu-route-wrapper" key={title}>
              <Link className={`menu-route ${link === window?.location.pathname ? 'active' : ''}`} to={link}>
                {title}
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Header;
