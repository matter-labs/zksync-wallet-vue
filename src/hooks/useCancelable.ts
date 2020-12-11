import { useCallback, useEffect, useRef } from 'react';

export function useCancelable() {
  const isCancelled = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      isCancelled.current = true;
    };
  }, [isCancelled]);

  return useCallback(<T>(fn: Promise<T> | (() => Promise<T>) | undefined) => {
    return new Promise<T>((resolve, reject) => {
      if (isCancelled.current || !fn) {
        reject(isCancelled.current ? 'callback is canceled' : 'No function for calling found');
      } else {
        const callbackResult = typeof fn === 'function' ? fn() : fn;
        callbackResult
          .then(receivedResult => {
            if (isCancelled.current) {
              reject('callback is canceled');
            } else {
              resolve(receivedResult);
            }
          })
          .catch(err => {
            if (isCancelled.current) {
              reject('callback is canceled');
            } else {
              reject(err);
            }
      });
      }
    });
  }, []);
}
