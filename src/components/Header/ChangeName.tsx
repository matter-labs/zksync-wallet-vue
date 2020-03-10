import React, { useCallback, useState } from 'react';

import { IChangeNameProps } from './Types';

const ChangeName: React.FC<IChangeNameProps> = ({ setModalOpen }): JSX.Element => {
  const oldName = localStorage.getItem('userName');

  const [newName, setNewName] = useState<string>(oldName ? oldName : '');

  const handleChangeName = useCallback(() => {
    localStorage.setItem('userName', newName);
    setModalOpen(false);
  }, [newName]);

  return (
    <>
      <h3>Change name</h3>
      <input placeholder="Enter new name" value={newName} onChange={e => setNewName(e.target.value)} />
      <button onClick={handleChangeName} className="btn btn submit-button">
        Save
      </button>
    </>
  );
};

export default ChangeName;
