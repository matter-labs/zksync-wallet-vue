import React from 'react';

export interface IBalancesProps {
  children?: React.ReactNode;
  data: any;
  dataProperty: string;
  ref?: any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setValue: (array: object[]) => void;
  title: string;
  visible: boolean;
}
