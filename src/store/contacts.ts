import { getterTree, mutationTree } from "typed-vuex";
import { Address, Contact } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import utils from "@/plugins/utils";

export const state = () => ({
  contactsList: [] as Array<Contact>,
});

export type ContactsModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  getContactsFromStorage(state) {
    try {
      const walletAddress = walletData.get().syncWallet!.address();
      let contactsList = window.localStorage.getItem("contacts-" + walletAddress);
      if (process.client && contactsList && window.localStorage.getItem("contacts-" + walletAddress)) {
        contactsList = JSON.parse(contactsList) || [];
        if (Array.isArray(contactsList)) {
          // @ts-ignore: Unreachable code error
          contactsList = contactsList.filter((contact) => utils.validateAddress(contact.address) && contact.name.length > 0);
          // @ts-ignore: Unreachable code error
          state.contactsList = contactsList;
          return;
        }
      }
      state.contactsList = [];
    } catch (error) {
      state.contactsList = [];
    }
  },
  saveContact(state, { name, address }) {
    const lowerCaseAddress = address.toLowerCase();
    for (let a = state.contactsList.length - 1; a >= 0; a--) {
      if (state.contactsList[a].address.toLowerCase() === lowerCaseAddress) {
        state.contactsList.splice(a, 1);
      }
    }
    state.contactsList.unshift({ name: name.trim(), address });
    if (process.client) {
      window.localStorage.setItem("contacts-" + walletData.get().syncWallet!.address(), JSON.stringify(state.contactsList));
    }
  },
  deleteContact(state, address) {
    const lowerCaseAddress = address.toLowerCase();
    for (let a = state.contactsList.length - 1; a >= 0; a--) {
      if (state.contactsList[a].address.toLowerCase() === lowerCaseAddress) {
        state.contactsList.splice(a, 1);
      }
    }
    if (process.client) {
      window.localStorage.setItem("contacts-" + walletData.get().syncWallet!.address(), JSON.stringify(state.contactsList));
    }
  },
});

export const getters = getterTree(state, {
  get(state) {
    return state.contactsList;
  },
  isInContacts(state): Function {
    return (address: Address): boolean => {
      address = address.toLowerCase();
      for (const contactItem of state.contactsList) {
        if (contactItem.address.toLowerCase() === address) {
          return true;
        }
      }
      return false;
    };
  },
  getByAddress(state): Function {
    return (address: Address): false | Contact => {
      address = address.toLowerCase();
      for (const contactItem of state.contactsList) {
        if (contactItem.address.toLowerCase() === address) {
          return contactItem;
        }
      }
      return false;
    };
  },
});
