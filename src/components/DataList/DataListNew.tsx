import React, { useEffect, ReactElement, useState, useMemo } from 'react';
import cl from 'classnames';

import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import { useDebounce } from 'hooks/useDebounce';
import { useAutoFocus } from 'hooks/useAutoFocus';

import './DataList.scss';

interface Props<T> {
  data: T[];
  title?: string;
  visible?: boolean;
  renderItem?: (i: T) => ReactElement | null;
  header?: () => ReactElement | null;
  footer?: () => ReactElement | null;
  searchPredicate?: (query: string, e: T) => boolean;
  onSetFiltered?: (data: T[]) => void;
  emptyListComponent?: () => ReactElement | null;
}

export function DataList<T>({
  data,
  title = '',
  visible = true,
  searchPredicate,
  renderItem,
  header = () => null,
  footer = () => null,
  onSetFiltered = () => null,
  emptyListComponent: EmptyPlaceholder = () => null,
}: Props<T>) {
  const [debouncedSearch, setSearch, searchValue] = useDebounce('', 500);
  const [filteredData, setFiltered] = useState<T[]>(data);
  const focusInput = useAutoFocus();

  useEffect(() => {
    if (!debouncedSearch) {
      if (data.length > filteredData.length) setFiltered(data);
      return;
    }

    const re = new RegExp(debouncedSearch, 'i');
    const filterCb = searchPredicate
      ? e => searchPredicate(debouncedSearch, e)
      : e => re.test(e);
    const filtered = data.filter(filterCb);
    setFiltered(filtered);
    onSetFiltered(filtered);
  }, [debouncedSearch]);

  const list = useMemo(() => filteredData.map(renderItem || (e => e as any)), [
    filteredData,
  ]);

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
        {header()}
        {list.length ? list : <EmptyPlaceholder />}
        {footer()}
      </div>
    </>
  );
}
