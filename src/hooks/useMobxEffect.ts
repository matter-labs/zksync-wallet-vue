import { useEffect } from 'react';
import { autorun } from 'mobx';

export function useMobxEffect(cb, deps: any[] = []) {
  useEffect(() => {
    let cleanup;
    const dispose = autorun(() => {
      if (typeof cleanup === 'function') cleanup();
      cleanup = cb();
    });
    return () => {
      dispose();
      if (typeof cleanup === 'function') cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
