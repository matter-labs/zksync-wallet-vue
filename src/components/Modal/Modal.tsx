import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import cl from 'classnames';

import { useRootData } from 'hooks/useRootData';

import Portal from './Portal';
import './Modal.scss';
import { useListener } from 'hooks/useListener';
import { Transition } from 'components/Transition/Transition';

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

  useListener(document, 'click', handleClickOutside, true);

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
  }, [walletName, zkWallet]);

  const shown = classSpecifier === isModalOpen || visible;

  return (
    <Portal className={cl(centered && 'center')}>
      <Transition type={transition} trigger={shown} timeout={100}>
        <div className={`modal ${classSpecifier}`}>
          <button onClick={closeHandler} className='close-icon' />
          {children}
        </div>
      </Transition>
      <Transition trigger={shown} type='opacity' timeout={100}>
        <div data-name='modal-wrapper' className={'modal-wrapper'} />
      </Transition>
    </Portal>
  );
};

export default Modal;
