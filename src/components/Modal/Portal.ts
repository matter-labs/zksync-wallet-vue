import { useRef, useLayoutEffect, FC } from 'react';
import cl from 'classnames';
import { createPortal } from 'react-dom';

interface Props {
  className?: string;
}

const Portal: FC<Props> = ({ children, className = '' }) => {
  const rootDiv = useRef(document.createElement('div'));
  useLayoutEffect(() => {
    const modal = rootDiv.current;
    modal.setAttribute('class', cl('modal-container', className));
    document.body.appendChild(modal);
    return () => {
      document.body.removeChild(modal);
    };
  }, [className]);

  return createPortal(children, rootDiv.current);
};

export default Portal;
