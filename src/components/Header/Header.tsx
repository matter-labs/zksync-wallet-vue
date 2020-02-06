import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';
import Modal from '../Modal/Modal';

const Header: React.FC = (): JSX.Element => {
  const [isModalOpen, openModal] = useState<boolean>(false);
  const [menuActive, setMenuActive] = useState<string>('');
  const myRef = useRef<HTMLDivElement>(null);
  const { ethId, zkWallet } = useRootData(({ ethId, zkWallet }) => ({
    ethId: ethId.get(),
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
            <button type="button" className="menu-wallet" onClick={() => openModal(!isModalOpen)}>
              <p>{ethId}</p>
              <img src="../../images/randomImage.png" alt="wallet" />
            </button>
            <Modal classSpecifier="wallet" open={isModalOpen} ref={myRef}></Modal>
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
