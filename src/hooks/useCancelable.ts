import { useEffect, useRef, useCallback } from 'react';

export function useCancelable() {
  const isCancelled = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      isCancelled.current = true;
    };
  }, [isCancelled]);

  const cb = useCallback(
    <T>(fn: Promise<T> | (() => Promise<T>) | undefined) => {
    return new Promise<T>((resolve, reject) => {
        if (isCancelled.current) return;
        if (!fn){
          return () => (resolve);
        }
        const p = typeof fn === 'function' ? fn() : fn;

        p.then(res => {
          if (!isCancelled.current) return resolve(res);
        }).catch(err => {
          if (!isCancelled.current) return reject(err);
      });
    });
    },
    [],
  );

  return cb;
}
