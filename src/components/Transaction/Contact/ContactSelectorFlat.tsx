import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import 'src/components/Transaction/Transaction.scss';

interface IContactSelectorFlatProps {
  body: Element | null;
  selectedContact: any;
}

export const ContactSelectorFlat: React.FC<IContactSelectorFlatProps> = observer(
  ({ body, selectedContact }): JSX.Element => {
    const store = useStore();

    const { TransactionStore } = store;

    return (
      <div
        className={`custom-selector contacts ${
          !!store.walletAddress.name || !!selectedContact ? '' : 'disabled'
        }`}
        onClick={() => {
          if (store.walletAddress.name || selectedContact) {
            TransactionStore.isContactsListOpen = !TransactionStore.isContactsListOpen;
            body?.classList.add('fixed-b');
          }
        }}
      >
        <div
          className={`custom-selector-title ${
            !!store.walletAddress.name || !!selectedContact ? '' : 'disabled'
          }`}
        >
          <p>
            {store.walletAddress.name
              ? store.walletAddress.name
              : selectedContact}
          </p>
          {(selectedContact || store.walletAddress.name) && (
            <div className='arrow-down'></div>
          )}
        </div>
      </div>
    );
  },
);
