import React, { useCallback, useEffect, useRef } from 'react';

import { IModal } from './Types';

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

  if (body) {
    isModalOpen ? body.classList.add('fixed') : body.classList.remove('fixed');
  }

  const handleClickOutside = useCallback(
    e => {
      if (myRef.current && !myRef.current.contains(e.target)) {
        setModal(false);
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
      <div ref={myRef} className={`modal ${classSpecifier} ${visible ? 'open' : 'closed'}`}>
        <button
          onClick={() => {
            cancelAction();
            setError('');
            setModal(false);
          }}
          className="close-icon"
        ></button>
        {children}
      </div>
      <div className={`modal-wrapper ${visible && background ? 'open' : 'closed'}`}></div>
    </>
  );
};

export default Modal;
