import { useEffect, useRef, useState, DependencyList } from 'react';

type Cb = (...args: any[]) => void;

export const useTimer = (baseSet, baseClear) => (
  cb: Cb,
  timeout = 250,
  deps: DependencyList = [],
) => {
  const callback = useRef<Cb>();

  useEffect(() => (callback.current = cb), [cb]);

  useEffect(() => {
    const tick = () => {
      callback.current && callback.current();
    };
    const t = baseSet(tick, timeout);
    return () => baseClear(t);
  }, [timeout, ...deps]);
};

export const useTimeout = useTimer(setTimeout, clearTimeout);
export const useInterval = useTimer(setInterval, clearInterval);
