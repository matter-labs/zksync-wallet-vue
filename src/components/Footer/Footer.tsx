import React, { useEffect, useState, useCallback } from 'react';

import { FOOTER_LINKS } from 'constants/footer';
import { LINKS_CONFIG } from 'src/config';

import { CookieBar } from './CookieBar';

import { useMobxEffect } from 'src/hooks/useMobxEffect';

import '../../index.scss';
import './Footer.scss';
import { useStore } from 'src/store/context';

const Footer: React.FC = (): JSX.Element => {
  const body = document.querySelector('body');
  const [darkTheme, setDarkTheme] = useState<boolean>(false);

  const store = useStore();

  const shortedGitHash = !!LINKS_CONFIG.lastGitCommitHash
    ? `.${LINKS_CONFIG.lastGitCommitHash.toString()}`
    : '';

  const handleSwitch = useCallback(() => {
    if (body) {
      darkTheme ? body.classList.add('dark') : body.classList.remove('dark');
    }
    setDarkTheme(!darkTheme);
  }, [body, darkTheme]);

  useEffect(() => {
    store.darkMode = darkTheme;
  }, [darkTheme]);

  useMobxEffect(() => {
    const theme = window.localStorage?.getItem('darkTheme');
    if (theme) {
      try {
        setDarkTheme(JSON.parse(theme));
      } catch {
        setDarkTheme(false);
      }
    }
  }, []);

  useMobxEffect(() => {
    localStorage
      ? window.localStorage?.setItem('darkTheme', JSON.stringify(darkTheme))
      : console.log('localStorage is not available');
    if (body) {
      darkTheme ? body.classList.add('dark') : body.classList.remove('dark');
    }
  }, [body, darkTheme]);

  return (
    <div className='footer-wrapper'>
      <button className='theme-switch' onClick={handleSwitch}></button>
      <div className='footer-menu'>
        {/* <div> */}
        {FOOTER_LINKS.map(({ title, link }) => (
          <a target='_blank' key={title} className='footer-link' href={link}>
            {title}
          </a>
        ))}
        <p>
          {'Made with ❤️ by Matter Labs'}
          <span>
            {' v. '}
            {process.env.VERSION}
            {shortedGitHash}
          </span>
        </p>
        {/* </div> */}
      </div>
      <CookieBar />
    </div>
  );
};

export default Footer;
