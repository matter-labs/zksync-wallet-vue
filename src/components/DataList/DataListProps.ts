import { ReactElement } from 'react';

type ReactComp = ReactElement | string | null;

export interface Props<T> {
  data?: T[];

  /**
   * @param amount Amount to fetch (will be appended to existing data).
   * Pass `undefined` to skip pagination
   */
  onFetch?: (amount?: number, offset?: number) => Promise<T[]>;
  title?: string;
  visible?: boolean;
  classSpecifier?: string;
  renderItem?: (i: T) => ReactComp | undefined | null | false;
  header?: () => ReactComp;
  footer?: () => ReactComp;
  emptyListComponent?: () => ReactComp;
  setTransactionType?: (
    transaction: 'deposit' | 'withdraw' | 'transfer' | undefined,
  ) => void;

  /**
   * @param query Search string
   * @param regex `RegExp` instance from search string with ignorecase flag
   */
  searchPredicate?: (e: T, query: string, regex: RegExp) => boolean;
  filterPredicate?: (e: T) => boolean;
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
   * @deprecated
   * Used for two-side data binding (for example,
   * when putting it in global store)
   */
  bindData?: [T[], (predicate: (data: T[]) => T[]) => any];

  /**
   * @deprecated
   */
  refreshInterval?: number;
}
