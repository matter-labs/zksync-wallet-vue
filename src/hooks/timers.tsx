/* eslint-disable react-hooks/rules-of-hooks */
import {
  useEffect,
  useRef,
  useState,
  DependencyList,
  useCallback,
} from 'react';

type Cb = (...args: any[]) => void;

export const useTimer = (baseSet, baseClear) => (
  cb: Cb,
  timeout = 250,
  deps: DependencyList = [],
  condition: any = true,
  performImmediate = false,
) => {
  const callback = useRef<Cb>();

  useEffect(() => (callback.current = cb), [cb]);

  useEffect(() => {
    if (!condition) return;
    const tick = () => {
      callback.current && callback.current();
    };
    if (performImmediate) tick();
    const t = baseSet(tick, timeout);
    return () => baseClear(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeout, ...deps]);
};

export function useSafeTimeout() {
  const [t, setT] = useState<number | undefined>();
  useEffect(
    () => () => {
      if (t) clearTimeout(t);
    },
    [t],
  );
  return useCallback(
    (cb, timeout) => {
      const t = setTimeout(cb, timeout);
      setT(t as any);
      return t;
    },
    [setT],
  );
}

export const useTimeout = useTimer(setTimeout, clearTimeout);
export const useInterval = useTimer(setInterval, clearInterval);
