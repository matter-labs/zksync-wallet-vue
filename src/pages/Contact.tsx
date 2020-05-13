import React, { useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';

import editicon from 'images/icon-edit.svg';
import deleteicon from 'images/mdi_delete.svg';

import { WIDTH_BP } from 'constants/magicNumbers';
import { Transition } from 'components/Transition/Transition';
import { FloatingMenu } from 'src/components/Common/FloatingMenu';

import { useStore } from 'src/store/context';
import { useTimeout } from 'src/hooks/timers';

export const Contact = ({ address, name, onDelete, onSetOldContact }) => {
  const history = useHistory();

  const store = useStore();

  const [copyOpened, setCopyOpened] = useState(false);
  useTimeout(() => copyOpened && setCopyOpened(false), 2000, [copyOpened]);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleCopy = useCallback(
    e => {
      e.stopPropagation();
      const el = inputRef.current;
      if (!el) return;
      if (address === el?.value) {
        el.focus();
        el.select();
        document.execCommand('copy');
        setCopyOpened(true);
      }
    },
    [address],
  );
  const handleEdit = useCallback(() => {
    store.modalSpecifier = 'add-contact edit-contact';
    onSetOldContact({ name: name, address: address });
  }, [address, name, onSetOldContact, store.modalSpecifier]);
  const handleDelete = useCallback(
    e => {
      e.stopPropagation();
      onDelete(name);
    },
    [name, onDelete],
  );

  return (
    <div className='balances-contact' onClick={handleEdit}>
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
          onClick={e => {
            e.stopPropagation();
            store.transactionType = 'transfer';
            store.walletAddress = { name, address };
            history.push('/send');
          }}
        >
          <Link to='/'></Link>
        </button>
        <button
          className='balances-contact-copy btn-tr'
          onClick={handleCopy}
        ></button>
        <input
          className='copy-block-input'
          readOnly
          value={address.toString()}
          ref={inputRef}
        />

        <FloatingMenu>
          <button className='contact-manage-edit' onClick={handleEdit}>
            <img src={editicon} alt='edit' />
            <p>{'Edit'}</p>
          </button>
          <button
            onClick={handleDelete}
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
