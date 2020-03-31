import { useEffect } from 'react';

export function useListener(
  target: EventTarget | null,
  event: string,
  listener: (e: Event) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    if (!target) return;
    target.addEventListener(event, listener, options);
    return () => target.removeEventListener(event, listener, options);
  }, [target, event, listener, options]);
}
