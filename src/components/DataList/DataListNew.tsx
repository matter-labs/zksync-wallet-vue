import React, {
  useEffect,
  ReactElement,
  useState,
  useMemo,
  useRef,
} from 'react';
import cl from 'classnames';

import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import { useDebouncedValue } from 'src/hooks/debounce';
import { useAutoFocus } from 'hooks/useAutoFocus';

import './DataList.scss';
import { useListener } from 'hooks/useListener';

type ReactComp = ReactElement | string | null;

interface Props<T> {
  data?: T[];
  onFetch?: (amount?: number, offset?: number) => Promise<T[]>;
  title?: string;
  visible?: boolean;
  renderItem?: (i: T) => ReactComp;
  header?: () => ReactComp;
  footer?: () => ReactComp;
  searchPredicate?: (e: T, query: string, regex: RegExp) => boolean;
  onSetFiltered?: (data: T[]) => void;
  emptyListComponent?: () => ReactComp;

  infScrollInitialCount?: number;
  loadMoreThreshold?: number;
  loadMoreAmount?: number;
}

export function DataList<T>({
  data,
  onFetch,
  title = '',
  visible = true,
  searchPredicate,
  renderItem,
  header = () => null,
  footer = () => null,
  onSetFiltered = () => null,
  emptyListComponent = () => null,
  infScrollInitialCount,
  loadMoreThreshold = 10,
  loadMoreAmount = 5,
}: Props<T>) {
  const [debouncedSearch, setSearch, searchValue] = useDebouncedValue('', 500);
  const [resolvedData, setResolvedData] = useState(data || []);
  const [filteredData, setFiltered] = useState<T[]>(data || []);
  const focusInput = useAutoFocus();
  const rootRef = useRef<HTMLDivElement>(null);
  const [debScrollTop, setScrollTop] = useDebouncedValue(0);
  const [itemAmount, setItemAmount] = useState(infScrollInitialCount);

  useEffect(() => {
    if (data?.length) setResolvedData(data);
  }, [data]);

  // lazy fetch
  useEffect(() => {
    if (typeof onFetch === 'function') {
      onFetch(itemAmount, 0).then(setResolvedData);
    }
  }, [onFetch, setFiltered, itemAmount]);

  useListener(
    rootRef.current,
    'scroll',
    () => setScrollTop(rootRef.current!.scrollTop),
    { passive: true },
  );

  // infinite scroll
  useEffect(() => {
    const root = rootRef.current;
    if (!(infScrollInitialCount && root)) return;
    const loadMore =
      root.scrollHeight - (root.scrollTop + root.offsetHeight) <
      loadMoreThreshold;
    if (!loadMore) return;
    setItemAmount(i => i! + loadMoreAmount);
  }, [debScrollTop]);

  // on search hook
  useEffect(() => {
    if (!searchPredicate || !resolvedData.length) return;
    if (!debouncedSearch) {
      if (resolvedData.length > filteredData.length) setFiltered(resolvedData);
      return;
    }
    const re = new RegExp(debouncedSearch, 'i');
    const filtered = resolvedData.filter(e =>
      searchPredicate(e, debouncedSearch, re),
    );
    setFiltered(filtered);
    onSetFiltered(filtered);
  }, [debouncedSearch, resolvedData]);

  const list = useMemo(() => {
    const data = searchPredicate ? filteredData : resolvedData;
    const res = data.map(renderItem || (e => e as any));
    if (itemAmount) return res.slice(0, itemAmount);
    return res;
  }, [renderItem, searchPredicate, resolvedData, filteredData, itemAmount]);

  return (
    <>
      <Modal
        visible={false}
        classSpecifier='add-contact addressless'
        background={true}
      >
        <SaveContacts title='Add contact' addressValue='' addressInput={true} />
      </Modal>
      <div
        ref={rootRef}
        className={cl('balances-wrapper', visible ? 'open' : 'closed')}
      >
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
        {list.length ? list : emptyListComponent()}
        {footer()}
      </div>
    </>
  );
}
