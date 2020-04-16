import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import cl from 'classnames';

import { useAutoFocus } from 'hooks/useAutoFocus';
import { useDebouncedValue } from 'hooks/debounce';
import { useListener } from 'hooks/useListener';
import { useCancelable } from 'hooks/useCancelable';
import { Props } from './DataListProps';

import './DataList.scss';
import { whyDidYouUpdate } from 'src/utils';

const DEFAULT_SEARCH = (o: any, _q: string, re: RegExp) => {
  if (typeof o === 'object') {
    const string = Object.entries(o).reduce(
      (acc, [_k, v]) => acc + (_k === 'symbol' ? `zk${v}` : v),
      '',
    );
    return re.test(string);
  }
  return re.test(o);
};

const noop = () => null;

export function DataList<T>({
  data,
  onFetch,
  title = '',
  // visible = true,
  searchPredicate = DEFAULT_SEARCH,
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
    if (binded) {
      return binded;
    } else if (resolvedData.length) {
      return resolvedData;
    } else if (data) {
      return data;
    }
    return [];
  }, [data, binded, resolvedData]);

  // Lazy fetch
  const cancelable = useCancelable();
  useEffect(() => {
    if (!hasMore || typeof onFetch !== 'function') return;

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

    cancelable(
      onFetch(amount, offset).then(res => {
        if (res.length) {
          const pred = d => d.slice(0, offset).concat(res);
          if (setBinded) {
            setBinded(pred);
          } else {
            setResolvedData(pred);
          }
        } else {
          setHasMore(false);
        }
      }),
    );
  }, [
    onFetch,
    setFiltered,
    itemAmount,
    setBinded,
    cancelable,
    hasMore,
    infScrollInitialCount,
    loadMoreAmount,
  ]);

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

    return data.map(renderItem || (e => e as any));
  }, [
    itemAmount,
    renderItem,
    getData,
    infScrollInitialCount,
    onSort,
    debouncedSearch,
    filteredData,
  ]);

  return (
    <div ref={rootRef} className={cl('balances-wrapper', 'open')}>
      <h3 className='balances-title'>{title}</h3>
      <input
        type='text'
        ref={focusInput}
        onChange={e => setSearch(e.target.value)}
        value={searchValue}
        placeholder={`Filter ${title.toLowerCase().replace(/.?(select )/, '')}`}
        className='balances-search'
      />
      {header()}
      {list.length ? list : emptyListComponent()}
      {footer()}
    </div>
  );
}
