import React from 'react';

import useLocalStorage from '../hooks/useLocalStorage';

import DataList from '../components/DataList/DataList';

const Contacts: React.FC = (): JSX.Element => {
  const data = useLocalStorage('contacts');
  console.log(data);

  return <DataList title="Contacts" visible={true} />;
};

export default Contacts;
