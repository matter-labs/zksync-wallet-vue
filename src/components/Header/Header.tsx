import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Button, Menu } from 'antd';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';

const Header: React.FC = (): JSX.Element => {
  const [isModalOpen, openModal] = useState<boolean>(false);
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  const { ethId, setAccessModal, setProvider, setWalletName, setZkWallet } = useRootData(
    ({ ethId, setAccessModal, setProvider, setWalletName, setZkWallet }) => ({
      ethId: ethId.get(),
      setAccessModal,
      setProvider,
      setWalletName,
      setZkWallet,
    }),
  );

  const handleClickOutside = useCallback(e => {
    if (ref.current && !ref.current.contains(e.target)) {
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
      <Link to="/">ZK Synk</Link>
      <Menu mode="horizontal">
        {HEADER_ITEMS.map(({ title, link }) => (
          <Menu.Item key={title}>
            <Link to={link}>{title}</Link>
          </Menu.Item>
        ))}
      </Menu>
      <button type="button" className="menu-wallet" onClick={() => openModal(!isModalOpen)}>
        <img src="../../images/randomImage.png" alt="wallet" />
        <p>{ethId}</p>
      </button>
      <div ref={ref} className={`wallet-modal ${isModalOpen ? 'open' : 'closed'}`}>
        <Button onClick={hanleLogOut}>Log out</Button>
      </div>
    </div>
  );
};

export default Header;
