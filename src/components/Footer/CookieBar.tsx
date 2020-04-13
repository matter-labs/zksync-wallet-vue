import React, { useState } from 'react';
import { Transition } from 'components/Transition/Transition';

const COOKIE_TEXT =
  "We use cookies to ensure that we give you the best experience on our website. If you continue without changing your settings, we'll assume that you are happy with it.";

export const CookieBar = () => {
  const [accepted, setAccepted] = useState(false);
  return (
    <Transition type='fly' trigger={!accepted}>
      <div className='cookiebar'>
        <div>{COOKIE_TEXT}</div>
        <button className='btn submit-button' onClick={() => setAccepted(true)}>
          {'Accept'}
        </button>
      </div>
    </Transition>
  );
};
