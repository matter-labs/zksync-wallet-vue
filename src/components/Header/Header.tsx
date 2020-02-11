import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';

import Modal from '../Modal/Modal';

import './Header.scss';

const Header: React.FC = (): JSX.Element => {
  const [menuActive, setMenuActive] = useState<string>('');
  const { ethId, isModalOpen, setModal, zkWallet } = useRootData(({ ethId, isModalOpen, setModal, zkWallet }) => ({
    ethId: ethId.get(),
    isModalOpen: isModalOpen.get(),
    setModal,
    zkWallet: zkWallet.get(),
  }));

  const handleClickOutside = e => {
    if (myRef.current && !myRef.current.contains(e.target)) {
      openModal(false);
    }
  }, []);

  const hanleLogOut = useCallback(() => {
    setProvider(null);
    setWalletName('');
    setAccessModal(false);
    setZkWallet(null);
    history.push('/');
  }, [history, setAccessModal, setProvider, setWalletName, setZkWallet]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [handleClickOutside]);

  return (
    <div className="menu-wrapper">
      <div className="menu-top">
        <Link className="menu-logo" to="/"></Link>
        {zkWallet?.address() && (
          <>
            <button type="button" className="menu-wallet" onClick={() => setModal(!isModalOpen)}>
              <p>{ethId}</p>
              <img src="../../images/randomImage.png" alt="wallet" />
            </button>
            <Modal visible={isModalOpen} background={true} classSpecifier="wallet">
              jopa
            </Modal>
          </>
        )}
      </div>
      <div className="menu-routes">
        {zkWallet?.address() &&
          HEADER_ITEMS.map(({ title, link }) => (
            <div className="menu-route-wrapper" key={title}>
              <Link
                onClick={() => setMenuActive(title)}
                className={`menu-route ${menuActive === title ? 'active' : ''}`}
                to={link}
              >
                {title}
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Header;
