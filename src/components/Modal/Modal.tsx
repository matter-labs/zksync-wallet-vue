import React, { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import cl from 'classnames';

import { useLogout } from 'hooks/useLogout';
import Portal from './Portal';
import { Transition } from 'components/Transition/Transition';
import Spinner from 'components/Spinner/Spinner';

import { WRONG_NETWORK } from 'constants/regExs.ts';
import { RIGHT_NETWORK_ID } from 'constants/networks';

import './Modal.scss';
import useWalletInit from 'src/hooks/useWalletInit';
import { useStore } from 'src/store/context';
import { useObserver, observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

export interface ModalProps {
  background: boolean;
  cancelAction?: any;
  children?: React.ReactNode;
  classSpecifier: string;
  visible: boolean;
  transition?: 'scale' | 'fly';
  centered?: boolean;
}

const Modal: React.FC<ModalProps> = observer(
  ({ cancelAction, children, classSpecifier, visible, centered = false }) => {
    const store = useStore();
    const overlayRef = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const handleLogOut = useLogout();
    const shown = classSpecifier === store.isModalOpen || visible;

    useMobxEffect(() => {
      const body = document.body;
      if (store.isModalOpen) {
        body.classList.add('fixed');
      }
      return () => body.classList.remove('fixed');
    });

    const handleClickOutside = useCallback(
      e => {
        if (e.target !== overlayRef.current) return;
        if (
          e.target.getAttribute('data-name') &&
          !store.error.match(WRONG_NETWORK) &&
          store.zkWallet &&
          classSpecifier === store.isModalOpen
        ) {
          e.stopPropagation();
          store.isModalOpen = '';
          store.error = '';
        }
      },
      [classSpecifier, store],
    );

    useEffect(
      () =>
        autorun(() => {
          document.addEventListener('click', handleClickOutside, true);
          return () =>
            document.removeEventListener('click', handleClickOutside, true);
        }),
      [handleClickOutside],
    );

    const closeHandler = useCallback(() => {
      if (store.error.match(WRONG_NETWORK) && store.zkWallet) {
        return;
      } else {
        if (cancelAction) {
          cancelAction();
        } else {
          store.isModalOpen = '';
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

    const { createWallet } = useWalletInit();
    const metaMaskConnected = store.hintModal?.match(/login/i);

    const accessModalContent = () => {
      const { walletName, zkWalletInitializing } = store;
      return (
        <>
          <h3 className='title-connecting'>
            {metaMaskConnected ? 'Connected to ' : 'Connecting to '}
            {walletName}
          </h3>
          <div
            className={`${walletName.replace(/\s+/g, '').toLowerCase()}-logo`}
          ></div>
          {zkWalletInitializing && (
            <>
              <Spinner />
              <p className='modal-instructions'>
                {'Follow the instructions in the pop up'}
              </p>
            </>
          )}
          {!zkWalletInitializing && (
            <button
              className='btn submit-button'
              onClick={() => createWallet()}
            >
              {`Login with ${walletName}`}
            </button>
          )}

          <button
            onClick={() => handleLogOut(false, '')}
            className='btn btn-cancel btn-tr '
          >
            {'Cancel'}
          </button>
        </>
      );
    };

    const errorModalContent = () => {
      const { zkWallet, error, provider, hintModal, walletName } = store;
      return (
        <>
          {zkWallet &&
            error &&
            provider &&
            provider.networkVersion === RIGHT_NETWORK_ID && (
              <button onClick={closeHandler} className='close-icon' />
            )}
          {!zkWallet && (
            <h3 className='title-connecting'>
              {`${
                hintModal && hintModal.match(/(?:login)/i)
                  ? hintModal
                  : 'Connecting to '
              } ${walletName}`}
            </h3>
          )}
          {provider && provider.networkVersion !== RIGHT_NETWORK_ID ? (
            <>
              <div
                className={`${walletName
                  .replace(/\s+/g, '')
                  .toLowerCase()}-logo`}
              ></div>
              <div className='wrong-network'>
                {provider &&
                walletName === 'Metamask' &&
                provider.networkVersion === RIGHT_NETWORK_ID ? null : (
                  <div className='wrong-network-logo'></div>
                )}
                <p>{error}</p>
              </div>
            </>
          ) : (
            <p>{error}</p>
          )}
          {!zkWallet && (
            <button
              className='btn submit-button'
              onClick={() => handleLogOut(false, '')}
            >
              {`Disconnect ${walletName}`}
            </button>
          )}
        </>
      );
    };

    const plainModalContent = () => (
      <>
        {classSpecifier !== 'wc' && (
          <button onClick={closeHandler} className='close-icon' />
        )}
        {children}
      </>
    );

    const { isAccessModalOpen, error, zkWallet } = store;
    return (
      <Portal className={cl(centered && 'center')}>
        <Transition type='modal' trigger={shown}>
          <div
            ref={overlayRef}
            data-name='modal-wrapper'
            className='modal-wrapper'
          >
            <div className={`modal ${classSpecifier}`}>
              {((isAccessModalOpen && !error) || (!zkWallet && !error)) &&
                classSpecifier !== 'wc' &&
                accessModalContent()}
              {/*//TODO: remove classSpecifier === 'wc' */}
              {error && errorModalContent()}
              {((zkWallet && !error) || classSpecifier === 'wc') &&
                plainModalContent()}
              {/*//TODO: remove classSpecifier === 'wc' */}
            </div>
          </div>
        </Transition>
      </Portal>
    );
  },
);

export default Modal;
