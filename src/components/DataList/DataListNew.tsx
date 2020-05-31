import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import cl from 'classnames';

import { useAutoFocus } from 'hooks/useAutoFocus';
import { useDebouncedValue } from 'hooks/debounce';
import { useListener } from 'hooks/useListener';
import { useCancelable } from 'hooks/useCancelable';
import { useInterval } from 'hooks/timers';

import { Props } from './DataListProps';
import './DataList.scss';

const DEFAULT_SEARCH = (o: any, _q: string, re: RegExp) => {
  if (typeof o === 'object') {
    const string = Object.entries(o).reduce((acc, [_k, v]) => acc + v, '');
    return re.test(string);
  }
  return re.test(o);
};

const noop = () => null;

export function DataList<T>({
  data,
  onFetch,
  title = '',
  searchPredicate = DEFAULT_SEARCH,
  filterPredicate,
  renderItem,
  header = noop,
  footer = noop,
  onSetFiltered = noop,
  emptyListComponent = noop,
  infScrollInitialCount,
  loadMoreThreshold = 10,
  loadMoreAmount = 5,
  onSort,
  bindData,
  refreshInterval = 0,
}: Props<T>) {
  const [debouncedSearch, setSearch, searchValue] = useDebouncedValue('', 500);
  const focusInput = useAutoFocus();
  const rootRef = useRef<HTMLDivElement>(null);

  const [debScrollTop, setScrollTop] = useDebouncedValue(0);
  const [hasMore, setHasMore] = useState(true);
  const [itemAmount, setItemAmount] = useState(infScrollInitialCount || 0);

  // Used for local holding ONLY fetched data, not `data` or `bindData`
  const [resolvedData, setResolvedData] = useState(data || []);

  // Used for temp data from search query
  const [filteredData, setFiltered] = useState<T[]>(data || []);
  const binded = bindData && bindData[0];
  const setBinded = bindData && bindData[1];

  const getData = useCallback(() => {
    if (data) return data;
    if (binded) return binded;
    if (resolvedData.length) return resolvedData;
    return [];
  }, [data, binded, resolvedData]);

  // Lazy fetch
  const cancelable = useCancelable();
  const refreshData = useCallback(() => {
    if (typeof onFetch !== 'function') return;
    const amount = infScrollInitialCount
      ? itemAmount <= infScrollInitialCount
        ? infScrollInitialCount
        : loadMoreAmount
      : undefined;
    const offset = infScrollInitialCount
      ? itemAmount <= infScrollInitialCount
        ? 0
        : itemAmount - loadMoreAmount
      : undefined;

    return cancelable(onFetch(amount, offset)).then(res => {
      const pred = d => d.slice(0, offset).concat(res);
      if (setBinded) {
        setBinded(pred);
      } else {
        setResolvedData(pred);
      }
      return res.length;
    });
  }, [
    onFetch,
    itemAmount,
    setBinded,
    cancelable,
    infScrollInitialCount,
    loadMoreAmount,
  ]);

  useEffect(() => {
    if (!hasMore || typeof onFetch !== 'function') return;
    refreshData()?.then(length => {
      if (!length) setHasMore(false);
    });
  }, [refreshData, setHasMore, hasMore, onFetch]);

  // Infinite scroll
  useListener(
    rootRef,
    'scroll',
    () => setScrollTop(rootRef.current!.scrollTop),
    { passive: true },
  );
  useEffect(() => {
    const root = rootRef.current;
    if (!(infScrollInitialCount && root && hasMore)) return;
    const loadMore =
      root.scrollHeight !== root.offsetHeight &&
      root.scrollHeight - (root.scrollTop + root.offsetHeight) <
        loadMoreThreshold;
    if (!loadMore) return;
    setItemAmount(i => i! + loadMoreAmount);
  }, [
    debScrollTop,
    hasMore,
    infScrollInitialCount,
    loadMoreAmount,
    loadMoreThreshold,
  ]);

  useInterval(refreshData, refreshInterval, [], refreshInterval > 0);

  // Search hook
  useEffect(() => {
    const resolvedData = getData();
    if (!(searchPredicate && debouncedSearch && resolvedData.length)) return;
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
  }, [
    debouncedSearch,
    filteredData.length,
    getData,
    setFiltered,
    onSetFiltered,
    searchPredicate,
  ]);

  // Memoized list with mapped data
  const list = useMemo(() => {
    let data = debouncedSearch ? filteredData : getData();
    if (typeof onSort === 'function') {
      data = onSort(data);
    }
    if (infScrollInitialCount && itemAmount) {
      data = data.slice(0, itemAmount);
    }
    if (filterPredicate) {
      data = data.filter(filterPredicate);
    }

    return data.map(renderItem || (e => e as any));
  }, [
    itemAmount,
    renderItem,
    getData,
    infScrollInitialCount,
    onSort,
    debouncedSearch,
    filteredData,
    filterPredicate,
  ]);

  const makeFirstLetterToLowerCase = string =>
    string?.charAt(0).toLowerCase() + string?.slice(1);

  return (
    <div ref={rootRef} className={cl('balances-wrapper', 'open')}>
      <h3 className='balances-title'>{title}</h3>
      <input
        type='text'
        ref={focusInput}
        onChange={e => setSearch(e.target.value)}
        value={searchValue}
        placeholder={`Filter ${makeFirstLetterToLowerCase(title).replace(
          /.?(select )/,
          '',
        )}`}
        className='balances-search'
      />
      {header()}
      {list.length ? list : emptyListComponent()}
      {footer()}
    </div>
  );
}
