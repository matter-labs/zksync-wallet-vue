import React from 'react';

import './Spinner.scss';

const Spinner: React.FC = (): JSX.Element => {
  return (
    <span className='spinner'>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
      <span className='spinner-blade'></span>
    </span>
  );
};

export default Spinner;
