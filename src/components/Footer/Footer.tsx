import React, { useState, useCallback } from 'react';

import '../../index.scss';
import './Footer.scss';

const Footer: React.FC = (): JSX.Element => {
  const body = document.querySelector('body');
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const savedMode = localStorage.getItem('darkTheme');

  const handleSwitch = useCallback(() => {
    if (body) {
      darkTheme ? body.classList.add('dark') : body.classList.remove('dark');
    }
    setDarkTheme(!darkTheme);
    localStorage
      ? localStorage.setItem('darkTheme', JSON.stringify(darkTheme))
      : console.log('localStorage is not available');
  }, [body, darkTheme]);

  if (body && savedMode) {
    JSON.parse(savedMode) ? body.classList.add('dark') : body.classList.remove('dark');
  }

  return (
    <button className="theme-switch" onClick={() => handleSwitch()}>
      Switch
    </button>
  );
};

export default Footer;
