import { useEffect } from 'react';

import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
  const modal = document.createElement('div');

  useEffect(() => {
    document.body.appendChild(modal);
    return () => {
      document.body.removeChild(modal);
    };
  }, [modal]);

  return ReactDOM.createPortal(children, modal);
};

export default Portal;
