import React from 'react';
import { observer } from 'mobx-react-lite';

interface ICheckBoxProps {
  checked: boolean;
}

export const CheckBox: React.FC<ICheckBoxProps> = observer(
  ({ checked }): JSX.Element => {
    return (
      <div className='checkbox'>
        {checked && <div className='checkbox-check'></div>}
      </div>
    );
  },
);
