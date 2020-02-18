import React, { useEffect, useState, useCallback } from 'react';

import { FOOTER_LINKS } from '../../constants/footer';

import '../../index.scss';
import './Footer.scss';

const Footer: React.FC = (): JSX.Element => {
  const body = document.querySelector('body');
  const theme = localStorage.getItem('darkTheme') === 'true' ? true : false;
  const [darkTheme, setDarkTheme] = useState<boolean>(theme || false);

  const handleSwitch = useCallback(() => {
    if (body) {
      darkTheme ? body.classList.add('dark') : body.classList.remove('dark');
    }
    setDarkTheme(!darkTheme);
  }, [body, darkTheme]);

  useEffect(() => {
    localStorage
      ? localStorage.setItem('darkTheme', JSON.stringify(darkTheme))
      : console.log('localStorage is not available');
    if (body) {
      darkTheme ? body.classList.add('dark') : body.classList.remove('dark');
    }
  }, [body, darkTheme]);

  return (
    <div className="footer-wrapper">
      <button className="theme-switch" onClick={() => handleSwitch()}></button>
      <div className="footer-menu">
        <p>
          <span className="footer-links-block">
            {FOOTER_LINKS.map(({ title, link }) => (
              <a key={title} className="footer-link" href={link}>
                {title}
              </a>
            ))}
          </span>
          ZK Sync by Matter Labs
        </p>
      </div>
    </div>
  );
};

export default Footer;
