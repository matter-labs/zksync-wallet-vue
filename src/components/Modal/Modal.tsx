import React from 'react';

import { IModal } from './Types';

import './Modal.scss';

const Modal = React.forwardRef((props: IModal, ref: React.Ref<HTMLDivElement>) => {
  const body = document.querySelector('body');
  if (body) {
    props.open ? body.classList.add('fixed') : body.classList.remove('fixed');
  }

  return (
    <>
      <div ref={ref} className={`modal ${props.classSpecifier} ${props.open ? 'open' : 'closed'}`}>
        <button onClick={props.onClose} className="close-icon"></button>
      </div>
      <div className={`modal-wrapper ${props.open && props.background ? 'open' : 'closed'}`}></div>
    </>
  );
});

export default Modal;
