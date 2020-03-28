import React, { useEffect, ReactElement, useState, useMemo } from 'react';

import cl from 'classnames';
import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';

import { useRootData } from 'hooks/useRootData';

import './DataList.scss';
import { useDebounce } from 'hooks/useDebounce';
import { useAutoFocus } from 'hooks/useAutoFocus';

interface Props<T> {
  data: T[];
  title?: string;
  visible?: boolean;
  renderItem?: (i: T) => ReactElement | null;
  header?: () => ReactElement | null;
  filterCallback?: (e: T) => boolean;
  onSetFiltered?: (data: T[]) => void;
  emptyListComponent?: any;
}

export const DataList = function<T>({
  data = [],
  title = '',
  visible = true,
  filterCallback,
  renderItem,
  header: Header = () => null,
  onSetFiltered,
  emptyListComponent: EmptyPlaceholder,
}: Props<T>) {
  const { setModal } = useRootData(({ setModal }) => ({
    setModal,
  }));

  const [debouncedSearch, setSearch, searchValue] = useDebounce('', 500);
  const [filteredData, setFiltered] = useState<T[]>(data);

  useEffect(() => {
    if (!debouncedSearch) {
      if (data.length > filteredData.length) setFiltered(data);
      return;
    }

    const re = new RegExp(debouncedSearch, 'i');
    const filterCb = filterCallback || (e => re.test(e as any));
    const filtered = data.filter(filterCb);
    setFiltered(filtered);
    onSetFiltered && onSetFiltered(filtered);
  }, [debouncedSearch]);
  const focusInput = useAutoFocus();

  const list = useMemo(() => {
    const mapCb = renderItem || (e => e as any);
    return filteredData.map(mapCb);
  }, [filteredData]);

  return (
    <>
      <Modal
        visible={false}
        classSpecifier='add-contact addressless'
        background={true}
      >
        <SaveContacts title='Add contact' addressValue='' addressInput={true} />
      </Modal>
      <div className={cl('balances-wrapper', visible ? 'open' : 'closed')}>
        <h3 className='balances-title'>{title}</h3>
        <input
          type='text'
          ref={focusInput}
          onChange={e => setSearch(e.target.value)}
          value={searchValue}
          placeholder={`Filter ${title
            .toLowerCase()
            .replace(/.?(select )/, '')}`}
          className='balances-search'
        />
        <Header />
        {list}
        {list.length ? list : <EmptyPlaceholder />}
        {title === 'Contacts' && (
          <button
            className='add-contact-button btn-tr'
            onClick={() => setModal('add-contact addressless')}
          >
            <p>Add a contact</p>
          </button>
        )}
      </div>
    </>
  );
};
