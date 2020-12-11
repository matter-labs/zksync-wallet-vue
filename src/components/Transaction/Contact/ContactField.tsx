import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import 'src/components/Transaction/Transaction.scss';

interface IContactFieldProps {
  body: Element | null;
  isContactsListOpen: boolean;
  openContactsList: React.Dispatch<React.SetStateAction<boolean>>;
  selectedContact: any;
}

export const ContactField: React.FC<IContactFieldProps> = observer(
  ({
    body,
    isContactsListOpen,
    openContactsList,
    selectedContact,
  }): JSX.Element => {
    const store = useStore();

    const { walletAddress } = store;

    return (
      <div
        className={`custom-selector contacts ${
          !!walletAddress.name || !!selectedContact ? '' : 'disabled'
        }`}
        onClick={() => {
          if (walletAddress.name || selectedContact) {
            openContactsList(!isContactsListOpen);
            body?.classList.add('fixed-b');
          }
        }}
      >
        <div
          className={`custom-selector-title ${
            !!walletAddress.name || !!selectedContact ? '' : 'disabled'
          }`}
        >
          <p>{walletAddress.name ? walletAddress.name : selectedContact}</p>
          {(selectedContact || walletAddress.name) && (
            <div className='arrow-down'></div>
          )}
        </div>
      </div>
    );
  },
);
