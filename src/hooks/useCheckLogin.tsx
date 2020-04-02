import { useEffect } from 'react';
import { useRootData } from './useRootData';
import { useLocation, useHistory } from 'react-router-dom';

export function useCheckLogin() {
  const { pathname } = useLocation();
  const history = useHistory();
  const ethId = useRootData(s => s.ethId.get());

  useEffect(() => {
    if (ethId) return;
    history.push({ pathname: '/', search: `?redirect=${pathname.slice(1)}` });
  }, [ethId, history]);
}
