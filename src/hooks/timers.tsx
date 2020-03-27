import { useEffect, useRef, useState } from 'react';

type Cb = (...args: any[]) => void;

export function useInterval(cb: Cb, timeout = 250) {
  const callback = useRef<Cb>();

  useEffect(() => (callback.current = cb), [cb]);

  useEffect(() => {
    const tick = () => {
      callback.current && callback.current();
    };
    const t = setInterval(tick, timeout);
    return () => clearInterval(t);
  }, []);
}

export function useTimeout() {
  const [tID, setTID] = useState<number | undefined>();

  const cleanup = () => {
    if (tID) clearInterval(tID);
  };

  useEffect(() => cleanup, []);

  return (cb: Cb, timeout = 250, ...args: any[]) => {
    cleanup();
    setTID(setTimeout(cb, timeout, ...args) as any);
  };
}
