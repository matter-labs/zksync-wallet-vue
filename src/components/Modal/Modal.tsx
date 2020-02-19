import React, { useCallback, useEffect, useRef } from 'react';

import { IModal } from './Types';
import Portal from './Portal';

import { useRootData } from '../../hooks/useRootData';

import './Modal.scss';

const Modal: React.FC<IModal> = ({ background, cancelAction, children, classSpecifier, visible }): JSX.Element => {
  const { isModalOpen, setError, setModal } = useRootData(({ isModalOpen, setError, setModal }) => ({
    isModalOpen: isModalOpen.get(),
    setError,
    setModal,
  }));

  const myRef = useRef<HTMLDivElement>(null);
  const body = document.querySelector('body');

  useEffect(() => {
    if (body) {
      isModalOpen ? body.classList.add('fixed') : body.classList.remove('fixed');
    }
  });

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
  return (
    <>
      {(classSpecifier === isModalOpen || visible) && (
        <Portal>
          <div ref={myRef} className={`modal ${classSpecifier} open`}>
            <button
              onClick={() => {
                cancelAction();
                setError('');
                setModal('');
              }}
              className="close-icon"
            ></button>
            {children}
          </div>
          <div
            data-name="modal-wrapper"
            className={`modal-wrapper ${
              (classSpecifier === isModalOpen && background) || (visible && background) ? 'open' : 'closed'
            }`}
          ></div>
        </Portal>
      )}
    </>
  );
};

export default Modal;
