import React, { useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';

import editicon from 'images/icon-edit.svg';
import { WIDTH_BP } from 'constants/magicNumbers';
import { Transition } from 'components/Transition/Transition';
import { FloatingMenu } from 'src/components/Common/FloatingMenu';

import { useStore } from 'src/store/context';
import { useTimeout } from 'src/hooks/timers';

const editIcon = () => (
  <svg
    width='19'
    height='19'
    viewBox='0 0 19 19'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M0 15.2505V19.0005H3.75L14.81 7.94055L11.06 4.19055L0 15.2505ZM17.71 5.04055C18.1 4.65055 18.1 4.02055 17.71 3.63055L15.37 1.29055C14.98 0.900547 14.35 0.900547 13.96 1.29055L12.13 3.12055L15.88 6.87055L17.71 5.04055Z'
      fill='#8c8dfc'
    />
  </svg>
);

const sendIcon = () => (
  <svg
    width='25'
    height='25'
    viewBox='0 0 25 25'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M21.3164 12.2275L3.98014 3.53456C3.90967 3.49932 3.82885 3.49103 3.75216 3.50969C3.576 3.55321 3.46616 3.73147 3.50968 3.90972L5.29616 11.2098C5.3231 11.3197 5.40393 11.4088 5.51169 11.444L8.57274 12.4949L5.51377 13.5458C5.406 13.5831 5.32517 13.6701 5.3003 13.78L3.50968 21.0904C3.49103 21.1671 3.49932 21.248 3.53455 21.3164C3.61538 21.4801 3.81434 21.5464 3.98014 21.4656L21.3164 12.8224C21.3806 12.7913 21.4324 12.7374 21.4656 12.6752C21.5464 12.5094 21.4801 12.3104 21.3164 12.2275ZM5.55314 19.0136L6.5956 14.7521L12.7135 12.6524C12.7612 12.6358 12.8006 12.5985 12.8172 12.5488C12.8462 12.4617 12.8006 12.3685 12.7135 12.3374L6.5956 10.2398L5.55729 5.99487L18.5724 12.5218L5.55314 19.0136Z'
      fill='#8c8dfc'
    />
  </svg>
);

const copyIcon = () => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM15 5L21 11V21C21 22.1 20.1 23 19 23H7.99C6.89 23 6 22.1 6 21L6.01 7C6.01 5.9 6.9 5 8 5H15ZM14 12H19.5L14 6.5V12Z'
      fill='#8c8dfc'
    />
  </svg>
);

export const Contact = ({
  address,
  name,
  onDelete,
  onSetOldContact,
  setId,
}) => {
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
    <div
      className='balances-contact'
      onClick={e => {
        e.stopPropagation();
        store.transactionType = 'transfer';
        store.walletAddress = { name, address };
        history.push('/send');
      }}
    >
      <div className='balances-contact-left container'>
        <img src={makeBlockie(address)} alt='avatar' />
        <div className='balances-contact-left'>
          <span className='balances-contact-name'>{name}</span>
          <span className='balances-contact-address'>
            {window?.innerWidth > WIDTH_BP
              ? address
              : address.replace(address.slice(14, address.length - 4), '...')}
          </span>
        </div>
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
          {sendIcon()}
          <Link to='/'></Link>
        </button>
        <button className='balances-contact-copy btn-tr' onClick={handleCopy}>
          {copyIcon()}
        </button>
        <input
          className='copy-block-input'
          readOnly
          value={address.toString()}
          ref={inputRef}
        />
        <button
          className='contact-manage-edit btn-tr'
          onClick={e => {
            setId(name);
            e.stopPropagation();
            handleEdit();
          }}
        >
          {editIcon()}
        </button>
      </div>
    </div>
  );
};
