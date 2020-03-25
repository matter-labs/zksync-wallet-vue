import { useEffect, useRef, useLayoutEffect } from 'react';

import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
  const rootDiv = useRef(document.createElement('div'));
  useLayoutEffect(() => {
    const modal = rootDiv.current;
    modal.setAttribute('class', 'modal-container');
    document.body.appendChild(modal);
    return () => {
      document.body.removeChild(modal);
    };
  }, []);

  return ReactDOM.createPortal(children, rootDiv.current);
};

export default Portal;
