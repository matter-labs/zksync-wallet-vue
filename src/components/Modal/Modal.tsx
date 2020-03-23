import React, { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import Portal from './Portal';

import { IModalProps } from './Types';

import { useRootData } from '../../hooks/useRootData';

import './Modal.scss';

const Modal: React.FC<IModalProps> = ({ background, cancelAction, children, classSpecifier, visible }): JSX.Element => {
  const {
    isModalOpen,
    setAccessModal,
    setError,
    setModal,
    setProvider,
    setWalletName,
    setZkWallet,
    walletName,
    zkWallet,
  } = useRootData(({ isModalOpen, walletName, zkWallet, ...rest }) => ({
    isModalOpen: isModalOpen.get(),
    walletName: walletName.get(),
    zkWallet: zkWallet.get(),
    ...rest,
  }));

  const myRef = useRef<HTMLDivElement>(null);
  const history = useHistory();

  useEffect(() => {
    const body = document.querySelector('body');
    if (isModalOpen) {
      body?.classList.add('fixed');
    }
    return () => body?.classList.remove('fixed');
  }, [isModalOpen]);

  const handleClickOutside = useCallback(
    e => {
      if (e.target.getAttribute('data-name')) {
        e.stopPropagation();
        setModal('');
        setError('');
      }
    },
    [setError, setModal],
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [handleClickOutside]);

  const closeHandler = useCallback(() => {
    if (cancelAction) {
      cancelAction();
    } else {
      setModal('');
    }
    if (!zkWallet && !!walletName) {
      setProvider(null);
      setWalletName('');
      setAccessModal(false);
      setZkWallet(null);
      history.push('/');
      setModal('');
    }
  }, []);

  return (
    <>
      {(classSpecifier === isModalOpen || visible) && (
        <Portal>
          <div ref={myRef} className={`modal ${classSpecifier} open`}>
            <button onClick={closeHandler} className="close-icon" />
            {children}
          </div>
          <div
            data-name="modal-wrapper"
            className={`modal-wrapper ${
              (classSpecifier === isModalOpen && background) || (visible && background) ? 'open' : 'closed'
            }`}
          />
        </Portal>
      )}
    </>
  );
};

export default Modal;
