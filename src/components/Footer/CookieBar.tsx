import React, { useState } from 'react';
import { Transition } from 'components/Transition/Transition';
import { getCookie, setCookie } from 'src/utils';

const COOKIE_TEXT =
  "We use cookies to ensure that we give you the best experience on our website. If you continue without changing your settings, we'll assume that you are happy with it.";

export const CookieBar = () => {
  const [accepted, setAccepted] = useState(
    getCookie('accept-cookie') === 'true',
  );
  const clickHandler = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setCookie('accept-cookie', 'true', d);
    setAccepted(true);
  };

  return (
    <Transition type='fly' trigger={!accepted}>
      <div className='cookiebar'>
        <div>{COOKIE_TEXT}</div>
        <button className='btn submit-button' onClick={clickHandler}>
          {'Accept'}
        </button>
      </div>
    </Transition>
  );
};
