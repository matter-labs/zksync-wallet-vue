import React, { useState } from 'react';
import { Transition } from '../Transition/Transition';

export const FloatingMenu = ({ children }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Transition type='fly' trigger={opened}>
      <ul className='contact-manage'>{children}</ul>
    </Transition>
  );
};
