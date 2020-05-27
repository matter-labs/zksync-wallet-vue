import React, { useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
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
      if (store.error.match(WRONG_NETWORK) && store.zkWallet) {
        return;
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

    const { createWallet } = useWalletInit();
    const metaMaskConnected = store.hint?.match(/login/i);

    const info = store.hint.split('\n');

    const accessModalContent = () => {
      const { walletName, zkWalletInitializing } = store;
      return (
        <>
          <h3 className='title-connecting'>
            {metaMaskConnected ? 'Connected to ' : 'Connecting to '}
            {walletName}
          </h3>
          <div
            className={`${walletName &&
              walletName.replace(/\s+/g, '').toLowerCase()}-logo`}
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
            {zkWalletInitializing ? 'Close' : 'Cancel'}
          </button>
        </>
      );
    };

    const errorAppearence = () => (
      <>
        {store.hint && info && info[0].match(/(?:install)/i) && (
          <p>
            {info[0]}{' '}
            <a href={info[1]} target='_blank' rel='noopener noreferrer'>
              {'here'}
            </a>
          </p>
        )}
        {!store.error.match(/(?:detected)/i) && <p>{error}</p>}
      </>
    );

    const errorModalContent = () => {
      const { zkWallet, error, provider, hint, walletName } = store;
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
              {!error.match(/(?:detected)/i) &&
                `${
                  error && hint && hint.match(/(?:login)/i)
                    ? hint
                    : 'Connecting to '
                } ${walletName}`}
              {error.match(/(?:detected)/i) && error}
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
                {errorAppearence()}
              </div>
            </>
          ) : (
            errorAppearence()
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
