import { useRef, useEffect } from 'react';

export function useAutoFocus() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return ref;
}
