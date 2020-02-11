import React, { useEffect, useRef, useState, Children } from 'react';

import { IModal } from './Types';

import { useRootData } from '../../hooks/useRootData';

import './Modal.scss';

const Modal: React.FC<IModal> = ({ background, children, classSpecifier, visible }): JSX.Element => {
  const { error, isModalOpen, setError, setModal } = useRootData(({ error, isModalOpen, setError, setModal }) => ({
    error: error.get(),
    isModalOpen: isModalOpen.get(),
    setError,
    setModal,
  }));

  const myRef = useRef<HTMLDivElement>(null);
  const body = document.querySelector('body');

  if (body) {
    isModalOpen ? body.classList.add('fixed') : body.classList.remove('fixed');
  }

  const handleClickOutside = e => {
    if (myRef.current && !myRef.current.contains(e.target)) {
      setModal(false);
      setError('');
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <>
      <div ref={myRef} className={`modal ${classSpecifier} ${visible ? 'open' : 'closed'}`}>
        <button
          onClick={() => {
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
