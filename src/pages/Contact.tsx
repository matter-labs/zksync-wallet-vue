import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

import editicon from 'images/icon-edit.svg';
import deleteicon from 'images/mdi_delete.svg';

import { WIDTH_BP } from 'constants/magicNumbers';
import { Transition } from 'components/Transition/Transition';
import { FloatingMenu } from 'src/components/Common/FloatingMenu';
import { useTimeout } from 'src/hooks/timers';
import { useRootData } from 'src/hooks/useRootData';

export const Contact = ({ address, name, onDelete, onSetOldContact }) => {
  const { setModal, setTransactionType, setWalletAddress } = useRootData(
    s => s,
  );
  const [copyOpened, setCopyOpened] = useState(false);
  useTimeout(() => copyOpened && setCopyOpened(false), 2000, [copyOpened]);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleCopy = useCallback(
    address => {
      const el = inputRef.current;
      if (!el) return;
      if (address === el?.value) {
        el.focus();
        el.select();
        document.execCommand('copy');
        setCopyOpened(true);
      }
    },
    [inputRef],
  );

  return (
    <div className='balances-contact' key={name}>
      <div className='balances-contact-left'>
        <span className='balances-contact-name'>{name}</span>
        <span className='balances-contact-address'>
          {window?.innerWidth > WIDTH_BP
            ? address
            : address.replace(address.slice(14, address.length - 4), '...')}
        </span>
      </div>
      <div className='balances-contact-right'>
        <Transition type='fly' timeout={200} trigger={copyOpened}>
          <div className={'hint-copied open'}>
            <p>{'Copied!'}</p>
          </div>
        </Transition>
        <button
          className='balances-contact-send btn-tr'
          onClick={() => {
            setTransactionType('transfer');
            setWalletAddress([name, address]);
          }}
        >
          <Link to='/'></Link>
        </button>
        <button
          className='balances-contact-copy btn-tr'
          onClick={() => handleCopy(address)}
        ></button>
        <input
          className='copy-block-input'
          readOnly
          value={address.toString()}
          ref={inputRef}
        />

        <FloatingMenu>
          <button
            className='contact-manage-edit'
            onClick={() => {
              setModal('add-contact edit-contact');
              onSetOldContact({ name: name, address: address });
            }}
          >
            <img src={editicon} alt='edit' />
            <p>{'Edit'}</p>
          </button>
          <button
            onClick={() => onDelete(name)}
            className='contact-manage-delete btn-tr'
          >
            <img src={deleteicon} alt='edit' />
            <p>{'Delete'}</p>
            <Link to='/contacts'></Link>
          </button>
        </FloatingMenu>
      </div>
    </div>
  );
};
