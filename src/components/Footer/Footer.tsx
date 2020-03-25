import React, { useEffect, useState, useCallback } from 'react';

import { FOOTER_LINKS } from '../../constants/footer';

import '../../index.scss';
import './Footer.scss';

const Footer: React.FC = (): JSX.Element => {
  const body = document.querySelector('body');
  const [darkTheme, setDarkTheme] = useState<boolean>(false);

  const handleSwitch = useCallback(() => {
    if (body) {
      darkTheme ? body.classList.add('dark') : body.classList.remove('dark');
    }
    setDarkTheme(!darkTheme);
  }, [body, darkTheme]);

  useEffect(() => {
    const theme = localStorage.getItem('darkTheme');
    if (theme) {
      try {
        setDarkTheme(JSON.parse(theme));
      } catch {
        setDarkTheme(false);
      }
    }
  }, []);

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
      <button className="theme-switch" onClick={handleSwitch}></button>
      <div className="footer-menu">
        <p>
          <span className="footer-links-block">
            {FOOTER_LINKS.map(({ title, link }) => (
              <a target="_blank" key={title} className="footer-link" href={link}>
                {title}
              </a>
            ))}
          </span>
          zkSync by Matter Labs
        </p>
      </div>
    </div>
  );
};

export default Footer;
