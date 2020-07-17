import React, { useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import cl from 'classnames';

import { useLogout } from 'hooks/useLogout';
import Portal from './Portal';
import { Transition } from 'components/Transition/Transition';
import Spinner from 'components/Spinner/Spinner';

import { WRONG_NETWORK } from 'constants/regExs.ts';
import { LINKS_CONFIG } from 'src/config';

import './Modal.scss';
import useWalletInit from 'src/hooks/useWalletInit';
import { useStore } from 'src/store/context';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

export interface ModalProps {
  background: boolean;
  cancelAction?: () => void;
  children?: React.ReactNode;
  classSpecifier: string;
  visible: boolean;
  transition?: 'scale' | 'fly';
  centered?: boolean;
  clickOutside?: boolean;
}

const Modal: React.FC<ModalProps> = observer(
  ({
    cancelAction,
    children,
    classSpecifier,
    visible,
    centered = false,
    clickOutside = true,
  }) => {
    const store = useStore();
    const overlayRef = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const handleLogOut = useLogout();
    const shown = classSpecifier === store.modalSpecifier || visible;

    const handleClickOutside = useCallback(
      e => {
        if (e.target !== overlayRef.current || clickOutside === false) return;
        if (
          e.target.getAttribute('data-name') &&
          !store.error.match(WRONG_NETWORK) &&
          store.zkWallet &&
          classSpecifier === store.modalSpecifier
        ) {
          e.stopPropagation();
          store.modalSpecifier = '';
          store.error = '';
        }
      },
      [classSpecifier, store],
    );

    useMobxEffect(() => {
      document.addEventListener('click', handleClickOutside, true);
      return () =>
        document.removeEventListener('click', handleClickOutside, true);
    }, [handleClickOutside]);

    const closeHandler = useCallback(() => {
      if (store.error.match(WRONG_NETWORK)) {
        handleLogOut(false, '');
      } else {
        if (cancelAction) {
          cancelAction();
        } else {
          store.modalSpecifier = '';
        }
        if (!store.zkWallet && !!store.walletName) {
          store.provider = null;
          store.walletName = '';
          store.isAccessModalOpen = false;
          store.zkWallet = null;
          history.push('/');
        }
      }
    }, [cancelAction, history, store]);

    return (
      <Portal className={cl(centered && 'center')}>
        <Transition type='modal' trigger={shown}>
          <div
            ref={overlayRef}
            data-name='modal-wrapper'
            className='modal-wrapper'
          >
            <div className={`modal ${classSpecifier}`}>
              {(!!store.zkWallet ||
                store.modalSpecifier === 'modal-hint' ||
                (!store.zkWallet && !!store.error)) && (
                <button onClick={closeHandler} className='close-icon' />
              )}
              {children}
            </div>
          </div>
        </Transition>
      </Portal>
    );
  },
);

export default Modal;
