import { useEffect } from 'react';
import { autorun } from 'mobx';

export function useMobxEffect(cb, deps = undefined) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => autorun(cb), deps);
}
