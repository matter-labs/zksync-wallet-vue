import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { useTimeout } from 'src/hooks/timers';
import { Transition } from 'components/Transition/Transition';

library.add(fas);

interface ICopyBlockProps {
  children?: React.ReactNode;
  copyProp?: string;
  text?: string | number | undefined;
  classSpecifier?: string;
}

export const CopyBlock: React.FC<ICopyBlockProps> = observer(
  ({ text, children, copyProp, classSpecifier }) => {
    const [copyOpened, setCopyOpened] = useState(false);
    useTimeout(() => copyOpened && setCopyOpened(false), 2000, [copyOpened]);
    const [copyRef, setCopyRef] = useState('');

    const handleCopy = useCallback(
      e => {
        navigator.clipboard.writeText(e);
        setCopyRef(e);
        setCopyOpened(true);
      },
      [copyRef, copyOpened],
    );

    const copyArg = copyProp || text;

    return (
      <div
        className='copy-block'
        onClick={() => {
          handleCopy(copyArg);
        }}
      >
        <Transition type='fly' timeout={200} trigger={copyOpened}>
          <div className={'hint-copied open'}>
            <p>{'Copied!'}</p>
          </div>
        </Transition>

        {text && <p className={`copy-block-text ${classSpecifier}`}>{text}</p>}
        {children}
        <button
          onClick={() => {
            handleCopy(copyArg);
          }}
          className='copy-block-button btn-tr'
        ></button>
      </div>
    );
  },
);
