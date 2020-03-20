import React, { useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';

import avatar from '../../images/avatar.png';
import ChangeName from './ChangeName';
import Modal from '../Modal/Modal';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';

import './Header.scss';

const Header: React.FC = (): JSX.Element => {
  const {
    provider,
    setAccessModal,
    setModal,
    setProvider,
    setWalletName,
    setZkWallet,
    walletName,
    zkBalancesLoaded,
    zkWallet,
  } = useRootData(
    ({
      provider,
      setAccessModal,
      setModal,
      setProvider,
      setWalletName,
      setZkWallet,
      walletName,
      zkBalancesLoaded,
      zkWallet,
    }) => ({
      provider: provider.get(),
      setAccessModal,
      setModal,
      setProvider,
      setWalletName,
      setZkWallet,
      walletName: walletName.get(),
      zkBalancesLoaded: zkBalancesLoaded.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const userName = localStorage.getItem(zkWallet ? zkWallet.address() : '');

  const history = useHistory();

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const [isChangeNameOpen, openChangeName] = useState<boolean>(false);

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    address => {
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const input: any = document.getElementsByClassName('copy-block-input')[0];
        const range = document.createRange();
        range.selectNodeContents(input);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        input.setSelectionRange(0, 999999);
        document.execCommand('copy');
      } else {
        openCopyModal(true);
        inputRef.map(el => {
          if (address === el?.value) {
            el?.focus();
            el?.select();
            document.execCommand('copy');
          }
        });
        setTimeout(() => openCopyModal(false), 2000);
      }
    },
    [inputRef],
  );

  const handleLogOut = useCallback(() => {
    setModal('');
    setProvider(null);
    setWalletName('');
    setAccessModal(false);
    setZkWallet(null);
    history.push('/');
  }, [history, setAccessModal, setProvider, setWalletName, setZkWallet]);

  if (provider && walletName === 'Metamask') {
    provider.on('accountsChanged', () => {
      if (zkWallet && zkWallet?.address().toLowerCase() !== provider.selectedAddress.toLowerCase()) {
        sessionStorage.setItem('walletName', walletName);
        handleLogOut();
        const savedWalletName = sessionStorage.getItem('walletName');
        if (savedWalletName) {
          setWalletName(savedWalletName);
        }
      }
    });
  }

  return (
    <div className="menu-wrapper">
      <div className="menu-top">
        <Link className="menu-logo" to="/"></Link>
        {zkWallet?.address() && (
          <>
            <button type="button" className="menu-wallet" onClick={() => setModal('wallet')}>
              <p>
                {userName
                  ? userName
                  : zkWallet?.address().replace(zkWallet?.address().slice(9, zkWallet?.address().length - 4), '...')}
              </p>
              <img src={zkWallet ? makeBlockie(zkWallet.address()) : avatar} alt="avatar" />
              <div className="arrow-select"></div>
            </button>
            <Modal visible={false} background={true} classSpecifier="wallet">
              <div className="wallet-title">
                <img src={zkWallet ? makeBlockie(zkWallet.address()) : avatar} alt="avatar" />{' '}
                {userName
                  ? userName
                  : zkWallet?.address().replace(zkWallet?.address().slice(6, zkWallet?.address().length - 4), '...')}
              </div>
              <div onClick={() => handleCopy(zkWallet?.address())} className="copy-block">
                <div className={`hint-copied ${isCopyModal ? 'open' : ''}`}>
                  <p>Copied!</p>
                </div>
                <input
                  readOnly
                  className="copy-block-input"
                  value={zkWallet?.address().toString()}
                  ref={e => inputRef.push(e)}
                />
                <p>{zkWallet.address()}</p>
                <button className="copy-block-button" onClick={() => handleCopy(zkWallet.address())}></button>
              </div>
              <div className="wallet-qr">
                <img
                  src={`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${zkWallet.address()}`}
                  alt="wallet-qr"
                />
              </div>
              <div className="horizontal-line"></div>
              <div className="wallet-buttons">
                <button onClick={() => setModal('qr')}>
                  <span className="icon-qr"></span>Show QR code
                </button>
                <div className="horizontal-line"></div>
                <button onClick={() => openChangeName(true)}>
                  <span className="icon-edit"></span>Rename wallet
                </button>
                <div className="horizontal-line"></div>
                <button onClick={() => handleLogOut()}>
                  <span className="icon-disconnect"></span>Disconnect wallet
                </button>
                <div className="horizontal-line"></div>
              </div>
            </Modal>
            <Modal visible={false} background={true} classSpecifier="qr">
              <img
                src={`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${zkWallet.address()}`}
                alt="wallet-qr"
              />
            </Modal>
            <Modal
              visible={isChangeNameOpen}
              cancelAction={() => openChangeName(false)}
              background={true}
              classSpecifier="change-name"
            >
              <ChangeName setModalOpen={openChangeName} />
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
