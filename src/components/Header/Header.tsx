import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Menu } from 'antd';

import { useRootData } from '../../hooks/useRootData';

import { HEADER_ITEMS } from '../../constants/header';

const Header: React.FC = (): JSX.Element => {
  const [isModalOpen, openModal] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const { ethId } = useRootData(({ ethId }) => ({
    ethId: ethId.get(),
  }));

  const handleClickOutside = e => {
    if (ref.current && !ref.current.contains(e.target)) {
      openModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

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
      <div ref={ref} className={`wallet-modal ${isModalOpen ? 'open' : 'closed'}`}></div>
    </div>
  );
};

export default Header;
