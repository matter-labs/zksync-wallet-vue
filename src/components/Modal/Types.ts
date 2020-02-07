import React, { Ref, MouseEvent } from 'react';

export interface IModal {
  background: boolean;
  classSpecifier: string;
  onClose: any;
  open: boolean;
  ref: Ref<HTMLDivElement>;
}
