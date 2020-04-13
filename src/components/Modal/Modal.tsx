import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import cl from 'classnames';

import { useListener } from 'hooks/useListener';
import { useRootData } from 'hooks/useRootData';

import Portal from './Portal';
import { Transition } from 'components/Transition/Transition';

import { WRONG_NETWORK } from 'constants/regExs.ts';

import './Modal.scss';

export interface ModalProps {
  background: boolean;
  cancelAction?: any;
  children?: React.ReactNode;
  classSpecifier: string;
  visible: boolean;
  transition?: 'scale' | 'fly';
  centered?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  cancelAction,
  children,
  classSpecifier,
  visible,
  transition = 'scale',
  centered = false,
}) => {
  const {
    error,
    isModalOpen,
    provider,
    setAccessModal,
    setError,
    setModal,
    setProvider,
    setWalletName,
    setZkWallet,
    walletName,
    zkWallet,
  } = useRootData(
    ({ error, isModalOpen, provider, walletName, zkWallet, ...rest }) => ({
      error: error.get(),
      isModalOpen: isModalOpen.get(),
      provider: provider.get(),
      walletName: walletName.get(),
      zkWallet: zkWallet.get(),
      ...rest,
    }),
  );

  const history = useHistory();

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.classList.add('fixed');
    }
    return () => body.classList.remove('fixed');
  }, [isModalOpen]);

  const handleClickOutside = useCallback(
    e => {
      if (!e) return;
      if (e.target.getAttribute('data-name')) {
        e.stopPropagation();
        setModal('');
        setError('');
      }
    },
    [setError, setModal],
  );

  useListener(document, 'click', handleClickOutside, true);

  const closeHandler = useCallback(() => {
    if (!!error.match(WRONG_NETWORK) && !!zkWallet) {
      return;
    } else {
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
    }
  }, [error, walletName, zkWallet]);

  const shown = classSpecifier === isModalOpen || visible;

  return (
    <Portal className={cl(centered && 'center')}>
      <Transition type='modal' trigger={shown}>
        <div data-name='modal-wrapper' className='modal-wrapper'>
          <div className={`modal ${classSpecifier}`}>
            <button onClick={closeHandler} className='close-icon' />
            {children}
          </div>
        </div>
      </Transition>
    </Portal>
  );
};

export default Modal;
