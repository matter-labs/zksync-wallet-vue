import React, { useState, useCallback } from 'react';

import { FOOTER_LINKS } from '../../constants/footer';

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
    <div className="footer-wrapper">
      <button className="theme-switch" onClick={() => handleSwitch()}></button>
      <div className="footer-menu">
        <p>
          <span className="footer-links-block">
            {FOOTER_LINKS.map(({ title, link }) => (
              <>
                <a className="footer-link" href={link}>
                  {title}
                </a>
              </>
            ))}
          </span>
          ZK Sync by Matter Labs
        </p>
      </div>
    </div>
  );
};

export default Footer;
