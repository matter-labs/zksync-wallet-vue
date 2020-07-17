import React, { useCallback, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import { useMobxEffect } from 'src/hooks/useMobxEffect';

import { IChangeNameProps } from './Types';

const ChangeName: React.FC<IChangeNameProps> = observer(({ setModalOpen }) => {
  const store = useStore();

  const { zkWallet } = store;

  const inputRef = useRef<HTMLInputElement>(null);

  const oldName = window.localStorage?.getItem(
    zkWallet ? zkWallet.address() : '',
  );

  const [newName, setNewName] = useState<string>(oldName ? oldName : '');

  const handleChangeName = useCallback(
    e => {
      e.preventDefault();
      if (zkWallet) {
        window.localStorage?.setItem(zkWallet.address(), newName.trim());
      }
      setModalOpen(false);
    },
    [newName, setModalOpen, zkWallet],
  );

  useMobxEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form>
      <h3>{'Change name'}</h3>
      <input
        ref={inputRef}
        placeholder='Enter new name'
        value={newName}
        onChange={e => setNewName(e.target.value)}
      />
      <button
        type='submit'
        onClick={handleChangeName}
        className='btn submit-button'
      >
        {'Save'}
      </button>
    </form>
  );
});

export default ChangeName;
