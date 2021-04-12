import { Address, Contact } from "@/plugins/types";
import utils from "@/plugins/utils";
import { actionTree, getterTree, mutationTree } from "typed-vuex";

export declare interface iContacts {
  contactsList: Contact[];
  storageKey?: string;
}

export const state = (): iContacts => ({
  contactsList: [],
  storageKey: undefined,
});

export type ContactsModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setContactsList(state, contactsList: Contact[]): void {
    state.contactsList = contactsList;
  },
  add(state, contact: Contact): void {
    state.contactsList.unshift(contact);
  },
  delete(state, contact: Contact): void {
    const foundIndex = state.contactsList.indexOf(contact);
    if (foundIndex !== -1) {
      state.contactsList = state.contactsList.filter((singleContact) => singleContact.address.toLowerCase() !== contact.address.toLowerCase());
    }
  },
  setStorageKey(state, storageKey: string): void {
    state.storageKey = storageKey;
  },

  initContactsList(state): void {
    state.contactsList = [];
  },
});

export const getters = getterTree(state, {
  get: (state: ContactsModuleState): Contact[] => state.contactsList,
});

export const actions = actionTree(
  { state, mutations, getters },
  {
    getStorageKey({ state, commit }): string {
      if (state.storageKey === undefined) {
        const walletAddress: Address | undefined = this.app.$accessor.account.address;
        if (walletAddress === undefined) {
          throw new Error("Wallet address can't be undefined");
        }
        commit("setStorageKey", "contacts-" + walletAddress);
      }
      if (state.storageKey === undefined) {
        throw new Error("Storage key is empty");
      }
      return state.storageKey;
    },
    isInContacts({ state }, address: Address): boolean {
      address = address.toLowerCase();
      for (const contactItem of state.contactsList) {
        if (contactItem.address.toLowerCase() === address) {
          return true;
        }
      }
      return false;
    },
    getByAddress({ state }, address: Address): Contact | undefined {
      address = address.toLowerCase();
      for (const contactItem of state.contactsList) {
        if (contactItem.address.toLowerCase() === address) {
          return contactItem;
        }
      }
      return undefined;
    },
    getContactsFromStorage({ commit }): void {
      try {
        const walletAddress: Address | undefined = this.app.$accessor.account.address;
        if (walletAddress === undefined || !process.client) {
          commit("initContactsList");
          return;
        }
        const contactsListRaw: string | null = window.localStorage.getItem(this.app.$accessor.contacts.getStorageKey());
        if (contactsListRaw === null) {
          commit("initContactsList");
          return;
        }
        let contactsList: Contact[] = JSON.parse(contactsListRaw);
        contactsList = contactsList.filter((contact: Contact) => utils.validateAddress(contact.address) && contact.name.length > 0);
        commit("setContactsList", contactsList);
      } catch (error) {
        this.$sentry.captureException(error);
        commit("initContactsList");
      }
    },
    deleteContact({ commit }, address: Address): void {
      const contact: Contact | undefined = this.app.$accessor.contacts.getByAddress(address);
      if (contact !== undefined) {
        commit("delete", contact);
        this.app.$accessor.contacts.updateLocalStorage();
      }
    },
    saveContact({ state, commit }, contact: Contact): void {
      if (state.contactsList.includes(contact)) {
        commit("delete", contact);
      }
      commit("add", contact);
      this.app.$accessor.contacts.updateLocalStorage();
    },
    updateLocalStorage({ state }): void {
      if (process.client) {
        const storageKey: string = this.app.$accessor.contacts.getStorageKey();
        window.localStorage.setItem(storageKey, JSON.stringify(state.contactsList));
      }
    },
  },
);
