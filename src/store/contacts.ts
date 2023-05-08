/* eslint-disable require-await */
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { getAddress } from "ethers/lib/utils";
import { Address } from "zksync/build/types";
import { ModuleOptions, ZkContacts, ZkContact } from "@/types/zksync";

const nameLocalStoragePrefix = "customAddressName-";

export type ContactsState = {
  contacts: ZkContacts;
  forceUpdateValue: number;
};

export const state = (_: ModuleOptions): ContactsState => ({
  contacts: {},
  forceUpdateValue: Number.MIN_SAFE_INTEGER,
});

export const getters: GetterTree<ContactsState, ContactsState> = {
  contacts: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return Object.fromEntries(Object.entries(state.contacts).sort(([_, contact1], [__, contact2]) => (contact1.deleted === contact2.deleted ? 0 : contact1.deleted ? 1 : -1)));
  },
  contactsNotDeleted: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return Object.fromEntries(Object.entries(state.contacts).filter(([_, contact]) => !contact.deleted));
  },
  contactByAddress: (state) => (address: Address) => state.contacts[getAddress(address)],
  contactByAddressNotDeleted: (_, getters) => (address: Address) => getters.contactsNotDeleted[getAddress(address)],
  forceUpdateValue: (state) => state.forceUpdateValue,
};

export const mutations: MutationTree<ContactsState> = {
  setContacts: (state, contacts: ZkContacts) => (state.contacts = contacts),
  setContact: (state, contact: ZkContact) => {
    state.contacts[getAddress(contact.address)] = contact;
    state.forceUpdateValue++;
  },
  removeContact: (state, address: Address) => {
    address = getAddress(address);
    if (Object.prototype.hasOwnProperty.call(state.contacts, address)) {
      state.contacts[address] = { ...state.contacts[address], deleted: true };
    }
    state.forceUpdateValue++;
  },
  clear: (state) => (state.contacts = {}),
};

export const actions: ActionTree<ContactsState, ContactsState> = {
  async requestContacts({ commit, getters, rootGetters }) {
    const contactsJSON = localStorage.getItem(`contacts-${rootGetters["zk-account/address"]}`);
    if (contactsJSON) {
      try {
        const parsedContacts = JSON.parse(contactsJSON);
        let finalContacts: ZkContacts = {};
        if (typeof parsedContacts === "object") {
          finalContacts = parsedContacts;
        }
        if (Array.isArray(parsedContacts)) {
          for (const contact of parsedContacts) {
            finalContacts[contact.address] = {
              name: contact.name,
              address: getAddress(contact.address),
            };
          }
        }
        commit("setContacts", <ZkContacts>finalContacts);
      } catch (error) {
        console.warn("Error requesting contacts\n", error);
        commit("setContacts", {});
      }
    } else {
      commit("setContacts", {});
    }
    return getters.contacts;
  },
  async saveContacts({ getters, rootGetters }) {
    try {
      localStorage.setItem(
        `contacts-${rootGetters["zk-account/address"]}`,
        JSON.stringify(Object.fromEntries(Object.entries(<ZkContacts>getters.contacts).filter(([_, contact]) => !contact.deleted))),
      );
    } catch (error) {
      console.warn("Error saving contacts\n", error);
    }
  },
  async getAddressName(_, address: Address) {
    address = getAddress(address);
    return localStorage.getItem(nameLocalStoragePrefix + address);
  },
  async setAddressName(_, { name, address }: { name: string; address: Address }) {
    address = getAddress(address);
    if (typeof name !== "string" || name.trim().length === 0) {
      localStorage.removeItem(nameLocalStoragePrefix + address);
      return false;
    }
    localStorage.setItem(nameLocalStoragePrefix + address, name.trim());
    return true;
  },
  async setContact({ commit, dispatch }, contact: ZkContact) {
    contact.address = getAddress(contact.address);
    commit("setContact", contact);
    await dispatch("saveContacts");
  },
  async removeContact({ getters, commit, dispatch }, address: Address) {
    address = getAddress(address);
    commit("removeContact", address);
    const currentName = await dispatch("getAddressName", address);
    if (getters.contactByAddress(address) && getters.contactByAddress(address).name === currentName) {
      await dispatch("setAddressName", { name: null, address });
    }
    await dispatch("saveContacts");
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
