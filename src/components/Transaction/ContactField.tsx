import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';
import { useRootData } from 'hooks/useRootData';

import './Transaction.scss';

interface IContactFieldProps {
  body: Element | null;
  isContactsListOpen: boolean;
  openContactsList: React.Dispatch<React.SetStateAction<boolean>>;
  selectedContact: any;
}

export const ContactField: React.FC<IContactFieldProps> = ({
  body,
  isContactsListOpen,
  openContactsList,
  selectedContact,
}): JSX.Element => {
  const { walletAddress } = useRootData(({ walletAddress }) => ({
    walletAddress: walletAddress.get(),
  }));

  return (
    <div
      className={`custom-selector contacts ${
        !!walletAddress[0] || !!selectedContact ? '' : 'disabled'
      }`}
      onClick={() => {
        if (walletAddress[0] || selectedContact) {
          openContactsList(!isContactsListOpen);
          body?.classList.add('fixed-b');
        }
      }}
    >
      <div
        className={`custom-selector-title ${
          !!walletAddress[0] || !!selectedContact ? '' : 'disabled'
        }`}
      >
        <p>{walletAddress[0] ? walletAddress[0] : selectedContact}</p>
        {(selectedContact || walletAddress[0]) && (
          <div className='arrow-down'></div>
        )}
      </div>
    </div>
  );
};
