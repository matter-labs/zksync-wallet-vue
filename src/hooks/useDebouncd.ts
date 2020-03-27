import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type SetState<T> = Dispatch<SetStateAction<T>>;

export function useDebounce<T>(init: T, timeout = 250): [T, SetState<T>, T] {
  const [immediate, setImmediate] = useState(init);
  const [debounced, setDebounced] = useState(init);
  useEffect(() => {
    const t = setTimeout(setDebounced, timeout, immediate);
    return () => {
      clearTimeout(t);
    };
  }, [init, immediate, timeout]);
  return [debounced, setImmediate, immediate];
}
