import React, { useContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { Store } from './store';

export const storeContext = React.createContext<Store | null>(null);

export const StoreProvider: React.FC = ({ children }) => {
  const store = useLocalStore(() => new Store());

  return (
    <storeContext.Provider value={store}>{children}</storeContext.Provider>
  );
};

export function useStore() {
  const store = useContext(storeContext);
  if (!store) {
    throw new Error(
      'Store not found! Consider wrapping component in <Provider/>',
    );
  }
  return store;
}

export default StoreProvider;
