import React, { useCallback, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { IChangeNameProps } from './Types';

const ChangeName: React.FC<IChangeNameProps> = ({ setModalOpen }): JSX.Element => {
  const { zkWallet } = useRootData(({ zkWallet }) => ({
    zkWallet: zkWallet.get(),
  }));

  const oldName = localStorage.getItem(zkWallet ? zkWallet.address() : '');

  const [newName, setNewName] = useState<string>(oldName ? oldName : '');

  const handleChangeName = useCallback(() => {
    if (zkWallet) {
      localStorage.setItem(zkWallet.address(), newName);
    }
    setModalOpen(false);
  }, [newName, setModalOpen, zkWallet]);

  return (
    <form>
      <h3>Change name</h3>
      <input placeholder="Enter new name" value={newName} onChange={e => setNewName(e.target.value)} />
      <button type="submit" onClick={handleChangeName} className="btn btn submit-button">
        Save
      </button>
    </form>
  );
};

export default ChangeName;
