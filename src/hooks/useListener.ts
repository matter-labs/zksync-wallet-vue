import { useEffect, useRef, MutableRefObject } from 'react';

type Listener = (e: Event) => void;

export function useListener<T>(
  target: EventTarget | MutableRefObject<T> | null,
  event: string,
  listener: Listener,
  options?: boolean | AddEventListenerOptions,
) {
  const savedHandler = useRef<Listener>();

  useEffect(() => {
    savedHandler.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!target) return;
    const t = target!.hasOwnProperty('current')
      ? (target as any).current
      : target;

    const l = savedHandler.current;

    t.addEventListener(event, l, options);
    return () => t.removeEventListener(event, l, options);
  }, [target, event, options]);
}
