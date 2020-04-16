import React, {
  useEffect,
  ReactElement,
  useState,
  useMemo,
  useRef,
} from 'react';
import cl from 'classnames';

import { useAutoFocus } from 'hooks/useAutoFocus';
import { useDebouncedValue } from 'hooks/debounce';
import { useListener } from 'hooks/useListener';

import './DataList.scss';
import { useCancelable } from 'src/hooks/useCancelable';

type ReactComp = ReactElement | string | null;

interface Props<T> {
  data?: T[];
  /**
   * @param amount Amount to fetch (will be appended to existing data).
   * Pass `undefined` to skip pagination
   */
  onFetch?: (amount?: number, offset?: number) => Promise<T[]>;
  title?: string;
  visible?: boolean;

  renderItem?: (i: T) => ReactComp;
  header?: () => ReactComp;
  footer?: () => ReactComp;
  emptyListComponent?: () => ReactComp;

  /**
   * @param query Search string
   * @param regex `RegExp` instance from search string with ignorecase flag
   */
  searchPredicate?: (e: T, query: string, regex: RegExp) => boolean;
  onSetFiltered?: (data: T[]) => void;

  /**
   * Initial count of items to display
   * (if `undefined`, the feature will be disabled)
   */
  infScrollInitialCount?: number;

  /**
   * In pixels: remaining scroll height to start loading more items
   */
  loadMoreThreshold?: number;

  /**
   * How many items to load at one time
   */
  loadMoreAmount?: number;

  /**
   * Custom sort function
   * @param elements - Array of unsorted elements
   */
  onSort?: (elements: T[]) => T[];

  /**
   * Used for two-side data binding (for example,
   * when putting it in global store)
   */
  bindData?: [T[], (data: T[]) => any];
}

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

export function DataList<T>({
  data,
  onFetch,
  title = '',
  // visible = true,
  searchPredicate = DEFAULT_SEARCH,
  renderItem,
  header = () => null,
  footer = () => null,
  onSetFiltered = () => null,
  emptyListComponent = () => null,
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

  const getData = (withFilter = true) => {
    if (debouncedSearch && withFilter) {
      return filteredData;
    } else if (bindData) {
      return bindData[0];
    } else if (resolvedData.length) {
      return resolvedData;
    } else if (data) {
      return data;
    }
    return [];
  };

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
          if (bindData) {
            bindData[1](pred(bindData[0]));
          } else {
            setResolvedData(pred);
          }
        } else {
          setHasMore(false);
        }
      }),
    );
  }, [onFetch, setFiltered, itemAmount, bindData && bindData[1]]);

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
  }, [debScrollTop]);

  // Search hook
  useEffect(() => {
    const resolvedData = getData(false);
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
  }, [debouncedSearch, resolvedData, data, bindData]);

  // Memoized list with mapped data
  const list = useMemo(() => {
    let data = getData();
    // let data = searchPredicate ? filteredData : resolvedData;

    if (typeof onSort === 'function') {
      data = onSort(data);
    }
    if (infScrollInitialCount && itemAmount) {
      data = data.slice(0, itemAmount);
    }

    return data.map(renderItem || (e => e as any));
  }, [
    renderItem,
    searchPredicate,
    debouncedSearch,
    resolvedData,
    filteredData,
    itemAmount,
    bindData && bindData[0],
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
