import { useEffect, useRef, MutableRefObject } from 'react';

type Listener = (e: Event) => void;

export function useListener<T>(
  target: EventTarget | MutableRefObject<T> | null,
  event: string,
  listener: Listener,
  options?: boolean | AddEventListenerOptions,
) {
  const savedHandler = useRef();

  useEffect(() => (savedHandler.current = listener as any), [listener]);

  useEffect(() => {
    const t = target!.hasOwnProperty('current')
      ? (target as any).current
      : target;

    const l = savedHandler.current;

    t.addEventListener(event, l, options);
    return () => t.removeEventListener(event, l, options);
  }, [target, event]);
}
