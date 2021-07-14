import { Address } from "zksync/build/types";
import utils from "@/plugins/utils";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { ZkIContracts, ZkInContact } from "~/types/lib";

export const state = (): ZkIContracts => ({
  contactsList: [],
  storageKey: undefined,
});

export type ContactsModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setContactsList(state: ContactsModuleState, contactsList: ZkInContact[]): void {
    state.contactsList = contactsList;
  },
  add(state: ContactsModuleState, contact: ZkInContact): void {
    state.contactsList.unshift(contact);
  },
  deleteLocal(state: ContactsModuleState, contact: ZkInContact): void {
    state.contactsList = state.contactsList.filter((singleContact) => singleContact.address.toLowerCase() !== contact.address.toLowerCase());
  },
  setStorageKey(state: ContactsModuleState, storageKey: string): void {
    state.storageKey = storageKey;
  },

  initContactsList(state: ContactsModuleState): void {
    state.contactsList = [];
  },
});

export const getters = getterTree(state, {
  get: (state: ContactsModuleState): ZkInContact[] => state.contactsList,
  getStorageKey(_: unknown, __: unknown, ___: unknown, rootGetters: { [x: string]: any }): string {
    return `contacts-${rootGetters["account/address"]}`;
  },
  getByAddress(state: ContactsModuleState) {
    return (address: Address) => {
      address = address.toLowerCase();
      for (const contactItem of state.contactsList) {
        if (contactItem.address.toLowerCase() === address) {
          return contactItem;
        }
      }
      return false;
    };
  },
  isInContacts(state: ContactsModuleState) {
    return (address: Address) => {
      address = address.toLowerCase();
      for (const contactItem of state.contactsList) {
        if (contactItem.address.toLowerCase() === address) {
          return true;
        }
      }
      return false;
    };
  },
});

export const actions = actionTree(
  { state, mutations, getters },
  {
    requestStorageKey({ state, commit }): string {
      if (state.storageKey === undefined) {
        const walletAddress = this.app.$accessor.account.address;
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
    getContactsFromStorage({ commit }): void {
      try {
        const walletAddress = this.app.$accessor.account.address;
        if (walletAddress === undefined || !process.client) {
          commit("initContactsList");
          return;
        }
        const contactsListRaw = window.localStorage.getItem(this.app.$accessor.contacts.getStorageKey);
        if (contactsListRaw === null) {
          commit("initContactsList");
          return;
        }
        let contactsList: ZkInContact[] = JSON.parse(contactsListRaw);
        contactsList = contactsList.filter((contact: ZkInContact) => utils.validateAddress(contact.address) && contact.name.length > 0);
        commit("setContactsList", contactsList);
      } catch (error) {
        this.app.$sentry?.captureException(error);
        commit("initContactsList");
      }
    },
    deleteContact({ commit }, address: Address): void {
      console.log("delete contact", address);
      const contact = this.app.$accessor.contacts.getByAddress(address);
      if (contact) {
        commit("deleteLocal", contact);
        this.app.$accessor.contacts.updateLocalStorage();
      }
    },
    saveContact({ state, commit }, contact: ZkInContact): void {
      for (let a = 0; a < state.contactsList.length; a++) {
        if (state.contactsList[a].address.toLowerCase() === contact.address.toLowerCase()) {
          commit("deleteLocal", state.contactsList[a]);
        }
      }
      commit("add", contact);
      this.app.$accessor.contacts.updateLocalStorage();
    },
    updateLocalStorage({ state }): void {
      if (process.client) {
        window.localStorage.setItem(this.app.$accessor.contacts.getStorageKey, JSON.stringify(state.contactsList));
      }
    },
  },
);
