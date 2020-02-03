import React from 'react';
import Header from './components/Header/Header';
import { useRootData } from './hooks/useRootData';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const { ethId } = useRootData(({ ethId }) => ({
    ethId: ethId.get(),
  }));

  return (
    <>
      {ethId.length > 0 && <Header />}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>{children}</div>
    </>
  );
};

export default App;
