import React, { useEffect, useCallback } from 'react';

import Modal from '../Modal/Modal';
import SaveContacts from '../SaveContacts/SaveContacts';

import { useRootData } from '../../hooks/useRootData';

import { IBalancesProps } from './Types';

import './DataList.scss';

const DataList: React.FC<IBalancesProps> = ({
  children,
  data,
  dataProperty,
  setValue,
  title,
  visible,
}): JSX.Element => {
  const { setModal } = useRootData(({ setModal }) => ({
    setModal,
  }));

  useEffect(() => {
    setValue(data);
  }, [setValue]); // don't add data to the dependencies for preventing infinite loop

  const handleSearch = useCallback(
    e => {
      const searchQuery = e.target.value.toLowerCase();
      const displayedItems = data?.filter(el => {
        const searchValue =
          dataProperty === 'symbol' ? `zk${el[dataProperty]}`.toLowerCase() : el[dataProperty].toLowerCase();
        return searchValue.indexOf(searchQuery) !== -1;
      });
      setValue(displayedItems);
    },
    [data, dataProperty, setValue],
  );

  return (
    <>
      <Modal visible={false} classSpecifier="add-contact addressless" background={true}>
        <SaveContacts title="Add contact" addressValue="" addressInput={true} />
      </Modal>
      <div className={`balances-wrapper ${visible ? 'open' : 'closed'}`}>
        <h3 className="balances-title">{title}</h3>
        <input onChange={handleSearch} placeholder="Search token" className="balances-search" type="text" />
        {children}
        {title === 'Contacts' && (
          <button className="add-contact-button" onClick={() => setModal('add-contact addressless')}>
            <span></span>
            <p>Add a contact</p>
          </button>
        )}
      </div>
    </>
  );
};

export default DataList;
