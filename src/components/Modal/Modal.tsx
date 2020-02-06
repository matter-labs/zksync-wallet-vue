import React from 'react';

import { IModal } from './Types';

const Modal = React.forwardRef((props: IModal, ref: React.Ref<HTMLDivElement>) => {
  return <div ref={ref} className={`modal-${props.classSpecifier} ${props.open ? 'open' : 'closed'}`}></div>;
});

export default Modal;
