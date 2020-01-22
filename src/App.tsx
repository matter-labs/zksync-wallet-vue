import React from 'react';

import { IAppProps } from './types/Common';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  return (
    <>
      <header style={{ height: 50 }}></header>
      <div style={{ maxWidth: 900, margin: '0 auto' }}> {children}</div>
    </>
  );
};

export default App;
