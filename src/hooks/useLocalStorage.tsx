import { useState, useEffect } from 'react';

const useLocalStorage = (key: string) => {
  const [data, setData] = useState<any>('');

  useEffect(() => {
    const localStorageData = localStorage.getItem(key);
    setData(localStorageData && JSON.parse(localStorageData).length ? JSON.parse(localStorageData) : `${key} is empty`);
  }, [key]);
  return data;
};

export default useLocalStorage;
