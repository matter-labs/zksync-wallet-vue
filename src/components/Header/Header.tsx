import React, { useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import avatar from '../../images/avatar.png';
import ChangeName from './ChangeName';
import Modal from '../Modal/Modal';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';

import './Header.scss';

const Header: React.FC = (): JSX.Element => {
  const { setAccessModal, setModal, setProvider, setWalletName, setZkWallet, zkWallet } = useRootData(
    ({ setAccessModal, setModal, setProvider, setWalletName, setZkWallet, zkWallet }) => ({
      setAccessModal,
      setModal,
      setProvider,
      setWalletName,
      setZkWallet,
      zkWallet: zkWallet.get(),
    }),
  );

  const userName = localStorage.getItem('userName');

  const history = useHistory();

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const [isChangeNameOpen, openChangeName] = useState<boolean>(false);

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    address => {
      openCopyModal(true);
      inputRef.map(el => {
        if (address === el?.value) {
          el?.focus();
          el?.select();
          document.execCommand('copy');
        }
      });
      setModal('wallet');
      setTimeout(() => openCopyModal(false), 2000);
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
              <p>{userName ? userName : zkWallet.address()}</p>
              <img src={avatar} alt="avatar" />
              <div className="arrow-select"></div>
            </button>
            <Modal visible={false} background={true} classSpecifier="wallet">
              <div className="wallet-title">
                <img src={avatar} alt="avatar" />{' '}
                {userName
                  ? userName
                  : zkWallet?.address().replace(zkWallet?.address().slice(6, zkWallet?.address().length - 3), '...')}
              </div>
              <div onClick={() => handleCopy(zkWallet?.address())} className="copy-block">
                <div className={`hint-copied ${isCopyModal ? 'open' : ''}`}>
                  <p>Copied!</p>
                </div>
                <input
                  onChange={() => undefined}
                  className="copy-block-input"
                  value={zkWallet?.address()}
                  ref={e => inputRef.push(e)}
                />
                <p>{zkWallet.address()}</p>
                <button className="copy-block-button" onClick={() => handleCopy(zkWallet.address())}></button>
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
