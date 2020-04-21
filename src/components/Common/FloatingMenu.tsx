import React, { useState, useCallback, useRef } from 'react';
import { Transition } from 'components/Transition/Transition';
import { useListener } from 'src/hooks/useListener';
import cl from 'classnames';

import './floating-menu.scss';

export const FloatingMenu = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useListener(document.body, 'click', function(this: HTMLElement, e) {
    if (!rootRef.current?.contains(e.target as any)) {
      setOpened(false);
    }
  });

  const rootClickHandler = useCallback(e => e.stopPropagation(), []);
  const openClickHandler = useCallback(
    e => {
      e.stopPropagation();
      setOpened(true);
    },
    [setOpened],
  );

  return (
    <div className='menu-root'>
      <div ref={rootRef} className='menu-trigger' onClick={openClickHandler} />
      <Transition type='fly' trigger={opened}>
        <div
          className={cl('menu-content contact-manage')}
          onClick={rootClickHandler}
        >
          {children}
        </div>
      </Transition>
    </div>
  );
};
