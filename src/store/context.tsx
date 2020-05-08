import React, { useContext } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { createStore, TStore, Store } from './store';

export const storeContext = React.createContext<Store | null>(null);
export const fallbackStoreContext = React.createContext<TStore | null>(null);

export const StoreProvider: React.FC = ({ children }) => {
  const store = useLocalStore(() => new Store());
  const fallbackStore = useLocalStore(createStore);

  return (
    <fallbackStoreContext.Provider value={fallbackStore}>
      <storeContext.Provider value={store}>{children}</storeContext.Provider>
    </fallbackStoreContext.Provider>
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
