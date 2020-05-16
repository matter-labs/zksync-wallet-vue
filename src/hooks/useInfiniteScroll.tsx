import { useState, useCallback, useEffect } from 'react';
import { useStore } from 'src/store/context';
import { useDebouncedValue } from 'hooks/debounce';
import { useListener } from 'hooks/useListener';
import { useInterval } from 'hooks/timers';

export function useInfiniteScroll(
  onFetch,
  loadAmount = 5,
  loadMoreThreshold = 10,
  minimalAmount = 25,
) {
  const store = useStore();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [debScrollTop, setScrollTop] = useDebouncedValue(0);
  useListener(
    window,
    'scroll',
    () => setScrollTop(document.documentElement.scrollTop),
    { passive: true },
  );
  const refresh = useCallback(() => {
    onFetch(store.transactions.length || minimalAmount, 0).then(txs =>
      store.setTxs(txs),
    );
  }, [onFetch, store, minimalAmount]);
  useInterval(refresh, 2000, [store]);

  useEffect(() => {
    if (!hasMore) return;
    const root = document.documentElement;

    const loadMore =
      root.scrollHeight !== root.offsetHeight &&
      root.scrollHeight - (debScrollTop + root.offsetHeight) <
        loadMoreThreshold;
    if (loadMore) {
      setIsLoadingMore(true);
      onFetch(store.transactions.length + loadAmount, 0).then(res => {
        setIsLoadingMore(false);
        if (!res.length) {
          setHasMore(false);
          return;
        }
        store.setTxs(res);
      });
    }
  }, [
    setIsLoadingMore,
    debScrollTop,
    hasMore,
    loadAmount,
    loadMoreThreshold,
    onFetch,
    store,
  ]);

  return { isLoadingMore };
}
