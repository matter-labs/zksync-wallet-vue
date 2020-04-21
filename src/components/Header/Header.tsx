import React, { useCallback, useState } from 'react';
import makeBlockie from 'ethereum-blockies-base64';

import avatar from 'images/avatar.png';
import ChangeName from './ChangeName';
import Modal from 'components/Modal/Modal';
import { Link } from './Link';

import { useRootData } from 'hooks/useRootData';

import { HEADER_ITEMS } from 'constants/header';

import { QRCode } from 'components/QRCode/QRCode';
import { useTimeout } from 'hooks/timers';
import { Transition } from 'components/Transition/Transition';
import { ConnectionStatus } from 'components/Header/ConnectionStatus';
import { useLogout } from 'hooks/useLogout';
import './Header.scss';

const Header: React.FC = () => {
  const { setModal, zkWallet } = useRootData(s => ({
    setModal: s.setModal,
    zkWallet: s.zkWallet.get(),
  }));

  const address = zkWallet?.address();
  const userName = localStorage.getItem(zkWallet ? address! : '');

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const [isChangeNameOpen, openChangeName] = useState<boolean>(false);

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const input: any = document.getElementsByClassName(
          'copy-block-input',
        )[0];
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
      }
    },
    [inputRef],
  );

  const logout = useLogout();

  useTimeout(() => isCopyModal && openCopyModal(false), 2000, [isCopyModal]);

  return (
    <div className='menu-wrapper'>
      <div className='menu-top'>
        <Link
          onClick={() => (!zkWallet ? logout(false, '') : undefined)}
          className='menu-logo'
          to='/'
        ></Link>
        {address && (
          <>
            <button
              type='button'
              className='menu-wallet btn-tr'
              onClick={() => setModal('wallet')}
            >
              <p>
                {userName || `${address.slice(0, 11)}...${address.slice(-4)}`}
              </p>
              <img
                src={zkWallet ? makeBlockie(address) : avatar}
                alt='avatar'
              />
              <div className='arrow-select'></div>
            </button>
            <Modal visible={false} background={true} classSpecifier='wallet'>
              <div className='wallet-title'>
                <img
                  src={zkWallet ? makeBlockie(address) : avatar}
                  alt='avatar'
                />{' '}
                <p>
                  {userName || `${address.slice(0, 8)}...${address.slice(-4)}`}
                </p>
              </div>
              <div onClick={handleCopy} className='copy-block'>
                <Transition type='fly' timeout={200} trigger={isCopyModal}>
                  <div className={'hint-copied open'}>
                    <p>{'Copied!'}</p>
                  </div>
                </Transition>
                <input
                  readOnly
                  className='copy-block-input'
                  value={address.toString()}
                  ref={e => inputRef.push(e)}
                />
                <p>{address}</p>
                <button
                  className='copy-block-button btn-tr'
                  onClick={handleCopy}
                />
              </div>
              <QRCode data={address} />
              <div className='horizontal-line' />
              <div className='wallet-buttons'>
                <button className='btn-tr' onClick={() => setModal('qr')}>
                  <span className='icon-qr'></span>
                  {'Show QR code'}
                </button>
                <div className='horizontal-line'></div>
                <button className='btn-tr' onClick={() => openChangeName(true)}>
                  <span className='icon-edit'></span>
                  {'Rename wallet'}
                </button>
                <div className='horizontal-line'></div>
                <button className='btn-tr' onClick={() => logout(false, '')}>
                  <span className='icon-disconnect'></span>
                  {'Disconnect wallet'}
                </button>
                <div className='horizontal-line' />
              </div>
            </Modal>
            <Modal visible={false} background={true} classSpecifier='qr'>
              <QRCode data={address} />
            </Modal>
            <Modal
              visible={isChangeNameOpen}
              cancelAction={() => openChangeName(false)}
              background={true}
              classSpecifier='change-name'
              centered
            >
              <ChangeName setModalOpen={openChangeName} />
            </Modal>
          </>
        )}
      </div>
      <div className='menu-routes'>
        {address &&
          HEADER_ITEMS.map(({ title, link }) => (
            <div className='menu-route-wrapper' key={title}>
              <Link
                className={`menu-route ${
                  link === window?.location.pathname ? 'active' : ''
                }`}
                to={link}
              >
                {title}
              </Link>
            </div>
          ))}
      </div>
      <ConnectionStatus />
    </div>
  );
};

export default Header;
