import { useState, useEffect } from 'react';

type UseTimer = (
  defTimeout?: number,
) => (cb: (...args: any[]) => void, timeout?: number, ...args: any[]) => void;

function useTimer(baseSet, baseClear) {
  return (defTimeout = 250) => {
    const [timer, setTimer] = useState<number | null>(null);

    useEffect(() => {
      return () => {
        if (timer) {
          baseClear(timer);
          setTimer(null);
        }
      };
    }, [timer]);

    return (cb, timeout?: number, ...args) => {
      const t = baseSet(cb, timeout || defTimeout, ...args);
      setTimer(t as any);
    };
  };
}

export const useTimeout: UseTimer = useTimer(setTimeout, clearTimeout);
export const useInterval: UseTimer = useTimer(setInterval, clearInterval);
