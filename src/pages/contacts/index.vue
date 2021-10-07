<template>
  <div class="contactsPage dappPageWrapper">
    <i-modal v-model="contactModal.enabled" class="prevent-close" size="md">
      <template slot="header">
        <span v-if="contactModal.type === 'add'">Add contact</span>
        <span v-else-if="contactModal.type === 'edit'">Edit contact</span>
      </template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input ref="nameInput" v-model="contactModal.name" autofocus maxlength="20" placeholder="Name" size="lg" @keyup.enter="saveContact()" />
        <br />
        <div class="_padding-bottom-1">Address</div>
        <address-input ref="addressInput" v-model="contactModal.address" @enter="saveContact()" />
        <br />
        <div v-if="contactModal.error" class="modalError _padding-bottom-2">{{ contactModal.error }}</div>
        <i-button v-if="contactModal.type === 'edit'" block link size="md" variant="secondary" @click="deleteContact()">
          <v-icon name="ri-delete-bin-line" />&nbsp;&nbsp;Delete contact
        </i-button>
        <i-button block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>
    <div class="tileBlock contactTile">
      <div class="tileHeadline h3">
        <span>Contacts</span>
        <i-tooltip>
          <span class="icon-container _display-flex" @click="addNewContact()">
            <v-icon name="ri-add-fill" class="iconInfo" />
          </span>
          <template slot="body">Add contact</template>
        </i-tooltip>
      </div>
      <i-input v-if="isSearching || hasDisplayedContacts" ref="searchInput" v-model="search" placeholder="Filter contacts" autofocus maxlength="20">
        <i slot="prefix">
          <v-icon name="ri-search-line" />
        </i>
      </i-input>
      <div class="contactsListContainer genericListContainer">
        <div v-if="!isSearching && !hasDisplayedContacts" class="nothingFound _margin-bottom-0 _margin-top-1">
          <div>The contact list is empty</div>
          <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="addNewContact()">Add contact</i-button>
        </div>
        <div v-else-if="!hasDisplayedContacts" class="nothingFound">
          <span>
            Your search <b>"{{ search }}"</b> did not match any contacts
          </span>
        </div>
        <div
          v-for="(contact, address) in displayedContactsList"
          v-else
          :key="address"
          class="contactItem"
          :class="{ deleted: contact.deleted === true }"
          @click.self="openContact(contact)"
        >
          <user-img :wallet="contact.address" />
          <div class="contactInfo">
            <div class="contactName">{{ contact.name }}</div>
            <div class="contactAddress walletAddress">{{ contact.address }}</div>
          </div>
          <div class="iconsBlock">
            <template v-if="!contact.deleted">
              <i-tooltip placement="left" trigger="click">
                <i-button class="copyAddress" block link size="md" variant="secondary" @click="copyAddress(contact.address)">
                  <v-icon name="ri-clipboard-line" />
                </i-button>
                <template slot="body">Copied!</template>
              </i-tooltip>
              <i-button block link size="md" cla variant="secondary" @click="editContact(contact)">
                <v-icon name="ri-pencil-fill" />
              </i-button>
            </template>
            <i-button v-else class="iconsBlock" block link size="md" variant="secondary" @click="restoreDeleted(contact)">
              <v-icon name="ri-arrow-go-back-line" />
            </i-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { getAddress } from "ethers/lib/utils";
import { ZkContact, ZkContacts } from "matter-dapp-module/types";
import { searchInObject, copyToClipboard } from "matter-dapp-module/utils";
import { Address } from "zksync/build/types";

export default Vue.extend({
  data() {
    return {
      search: "",
      contactModal: {
        enabled: false,
        type: <"add" | "edit">"add",
        error: "",
        name: "",
        address: <Address>"",
        openedAddress: <Address | undefined>undefined,
      },
    };
  },
  computed: {
    isSearching(): boolean {
      return !!this.search.trim();
    },
    contactsList(): ZkContacts {
      return this.$store.getters["zk-contacts/contacts"];
    },
    displayedContactsList(): ZkContacts {
      return <ZkContacts>searchInObject(this.contactsList, this.search, ([_, contact]: [string, ZkContact]) => `${contact.name} - ${contact.address}`);
    },
    hasDisplayedContacts(): boolean {
      return Object.keys(this.displayedContactsList).length !== 0;
    },
  },
  methods: {
    addNewContact() {
      this.contactModal = {
        enabled: true,
        type: "add",
        error: "",
        name: "",
        address: "",
        openedAddress: undefined,
      };
    },
    editContact(contact: ZkContact) {
      this.contactModal = {
        enabled: true,
        type: "edit",
        error: "",
        name: contact.name,
        address: contact.address,
        openedAddress: contact.address,
      };
    },
    async saveContact() {
      if (this.contactModal.name.trim().length <= 0) {
        this.contactModal.error = "Invalid name";
        return;
      }
      if (!this.contactModal.address) {
        this.contactModal.error = "Invalid address";
        return;
      }
      if (getAddress(this.contactModal.address) === this.$store.getters["zk-account/address"]) {
        this.contactModal.error = "Can't add own address";
        return;
      }
      if (this.contactModal.openedAddress && getAddress(this.contactModal.openedAddress) !== getAddress(this.contactModal.address)) {
        await this.$store.dispatch("zk-contacts/removeContact", this.contactModal.openedAddress);
      }
      this.$store.dispatch("zk-contacts/setContact", { address: this.contactModal.address, name: this.contactModal.name.trim() });
      this.contactModal.enabled = false;
    },
    deleteContact() {
      this.$store.dispatch("zk-contacts/removeContact", this.contactModal.openedAddress);
      this.contactModal.enabled = false;
    },
    restoreDeleted(contact: ZkContact) {
      this.$store.dispatch("zk-contacts/setContact", { address: contact.address, name: contact.name });
      this.contactModal.enabled = false;
    },
    openContact(contact: ZkContact) {
      this.$router.push(`/contacts/${contact.address}`);
    },
    copyAddress(address: Address) {
      copyToClipboard(address);
    },
  },
});
</script>
