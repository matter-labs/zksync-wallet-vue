import React from 'react';

export interface IBalancesProps {
  children?: React.ReactNode;
  data: any;
  dataProperty: string;
  ref?: any;
  setValue: (array: Record<string, unknown>) => void;
  title: string;
  visible: boolean;
}
