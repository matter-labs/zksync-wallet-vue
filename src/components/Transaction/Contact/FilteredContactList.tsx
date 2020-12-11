import React from 'react';

import { WIDTH_BP } from 'constants/magicNumbers';

import { addressMiddleCutter } from 'src/utils';

import 'src/components/Transaction/Transaction.scss';

interface IFilteredContactListProps {
  filteredContacts: any;
  selectFilteredContact: any;
}

export const FilteredContactList: React.FC<IFilteredContactListProps> = ({
  filteredContacts,
  selectFilteredContact,
}): JSX.Element => {
  return (
    <div className='transaction-contacts-list'>
      {filteredContacts.map(({ name, address }) => (
        <div
          className='balances-contact'
          key={name}
          onClick={() => {
            selectFilteredContact(name, address);
          }}
        >
          <div className='balances-contact-left'>
            <p className='balances-contact-name'>{name}</p>
            <span className='balances-contact-address'>
              {window?.innerWidth > WIDTH_BP
                ? address
                : addressMiddleCutter(address, 14, 4)}
            </span>
          </div>
          <div className='balances-contact-right'></div>
        </div>
      ))}
    </div>
  );
};
