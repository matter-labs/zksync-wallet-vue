import React from 'react';

export interface IModal {
  classSpecifier: string;
  open: boolean;
  ref: React.Ref<HTMLDivElement>;
}
