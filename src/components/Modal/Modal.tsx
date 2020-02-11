import React, { useEffect, useRef, useState } from 'react';

import { IModal } from './Types';

import { useRootData } from '../../hooks/useRootData';

import './Modal.scss';

const Modal: React.FC<IModal> = ({ background, classSpecifier }): JSX.Element => {
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

  const handleClickOutside = e => {
    if (myRef.current && !myRef.current.contains(e.target)) {
      setModal(false);
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
      <div ref={myRef} className={`modal ${classSpecifier} ${isModalOpen ? 'open' : 'closed'}`}>
        <button
          onClick={() => {
            setError('');
            setModal(false);
          }}
          className="close-icon"
        ></button>
      </div>
      <div className={`modal-wrapper ${isModalOpen && background ? 'open' : 'closed'}`}></div>
    </>
  );
};

export default Modal;
