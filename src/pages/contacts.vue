<template>
  <div class="contactsPage dappPageWrapper">
    <i-modal v-model="addContactModal" class="prevent-close" size="md">
      <template slot="header">
        <span v-if="addContactType === 'add'">Add contact</span>
        <span v-else-if="addContactType === 'edit'">Edit contact</span>
      </template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input ref="nameInput" v-model="inputtedName" autofocus maxlength="20" placeholder="Name" size="lg" @keyup.enter="addContact()" />
        <br />
        <div class="_padding-bottom-1">Address</div>
        <address-input ref="addressInput" v-model="inputtedWallet" @enter="addContact()" />
        <br />
        <div v-if="modalError" class="modalError _padding-bottom-2">{{ modalError }}</div>
        <i-button v-if="addContactType === 'edit'" block link size="md" variant="secondary" @click="deleteContact()">
          <v-icon name="ri-delete-bin-line" />&nbsp;&nbsp;Delete contact
        </i-button>
        <i-button block variant="secondary" size="lg" @click="addContact()">Save</i-button>
      </div>
    </i-modal>
    <div v-if="!openedContact" class="tileBlock contactTile">
      <div class="tileHeadline h3">
        <span>Contacts</span>
        <i-tooltip>
          <span
            class="icon-container _display-flex"
            @click="
              addContactType = 'add';
              addContactModal = true;
            "
          >
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
        <div v-if="!isSearching && !hasDisplayedContacts" class="nothingFound _margin-bottom-0">
          <div>The contact list is empty</div>

          <i-button
            block
            link
            size="lg"
            variant="secondary"
            class="_margin-top-1"
            @click="
              addContactType = 'add';
              addContactModal = true;
            "
          >
            Add contact
          </i-button>
        </div>
        <div v-else-if="!hasDisplayedContacts" class="nothingFound">
          <span>
            Your search <b>"{{ search }}"</b> did not match any contacts
          </span>
        </div>
        <div v-for="(item, index) in displayedContactsList" v-else :key="index" class="contactItem" :class="{ deleted: item.deleted === true }" @click.self="openContact(item)">
          <user-img :wallet="item.address" />
          <div class="contactInfo">
            <div class="contactName">{{ item.name }}</div>
            <div class="contactAddress walletAddress">{{ item.address }}</div>
          </div>
          <div class="iconsBlock">
            <template v-if="!item.deleted">
              <i-tooltip placement="left" trigger="click">
                <i-button class="copyAddress" block link size="md" variant="secondary" @click="copyAddress(item.address)">
                  <v-icon name="ri-clipboard-line" />
                </i-button>
                <template slot="body">Copied!</template>
              </i-tooltip>
              <i-button block link size="md" cla variant="secondary" @click="editContact(item)">
                <v-icon name="ri-pencil-fill" />
              </i-button>
            </template>
            <i-button v-else class="iconsBlock" block link size="md" variant="secondary" @click="restoreDeleted(item)">
              <v-icon name="ri-arrow-go-back-line" />
            </i-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="computedReturnLink" class="returnBtn">
          <v-icon name="ri-arrow-left-line" />
        </nuxt-link>
        <div>
          <span v-if="openedContact.notInContacts">{{ openedContact.address.replace(openedContact.address.slice(6, openedContact.address.length - 3), "...") }}</span>
          <span v-else>{{ openedContact.name }}</span>
        </div>
      </div>
      <div v-if="openedContact.deleted === true" class="isDeleted">Contact is deleted</div>
      <wallet-address :wallet="openedContact.address" class="_margin-y-1" />
      <i-button
        v-if="openedContact.notInContacts"
        block
        link
        size="md"
        variant="secondary"
        @click="
          addContactType = 'add';
          inputtedWallet = openedContact.address;
          addContactModal = true;
        "
      >
        <v-icon name="ri-add-circle-fill" />&nbsp;&nbsp;Add contact
      </i-button>
      <i-button v-else-if="openedContact.deleted === false" block link size="md" variant="secondary" @click="editContact(openedContact)">
        <v-icon name="ri-pencil-fill" />&nbsp;&nbsp;Edit contact
      </i-button>
      <i-button v-else block link size="md" variant="secondary" @click="restoreDeleted()"> <v-icon name="ri-arrow-go-back-line" />&nbsp;&nbsp;Restore contact </i-button>
      <i-button block size="lg" variant="secondary" :to="`/transfer?w=${openedContact.address}`">
        <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer to contact
      </i-button>
    </div>
    <lazy-transactions v-if="openedContact" class="_margin-top-0" :address="openedContact.address" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router/types";
import { Address } from "zksync/build/types";
import utils from "~/plugins/utils";
import { ZkInContact } from "~/types/lib";

export default Vue.extend({
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      deletedContact: <ZkInContact | undefined>undefined,
      search: <string>"",
      addContactModal: <boolean>false,
      addContactType: "add",
      inputtedName: <string>"",
      inputtedWallet: <Address>"",
      editingWallet: <ZkInContact | null>null,
      modalError: <string>"",
      contactsList: <ZkInContact[]>this.$accessor.contacts.get.map((e) => ({ ...e, deleted: false, notInContacts: false })),
      fromRoute: <Route>{},
    };
  },
  computed: {
    computedReturnLink(): Route | string {
      return this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath && this.fromRoute?.path !== "/transfer" ? this.fromRoute : "/contacts";
    },
    walletAddressFull(): string {
      return this.$accessor.account.address || "";
    },
    displayedContactsList(): ZkInContact[] {
      return utils.searchInArr(this.search, this.contactsList, (e) => (e as ZkInContact).name) as ZkInContact[];
    },
    openedContact(): null | ZkInContact {
      const wallet = this.$route.query.w;
      if (!wallet) {
        return null;
      }
      for (const item of this.contactsList) {
        if (item.address.toLowerCase() === String(wallet).toLowerCase()) {
          return item;
        }
      }
      return {
        deleted: false,
        notInContacts: true,
        address: String(wallet),
        name: "",
      };
    },
    hasDisplayedContacts(): boolean {
      return this.displayedContactsList.length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
    modalTitle(): string {
      return `${this.addContactType} contact`;
    },
  },
  watch: {
    addContactModal(val: boolean) {
      if (!val) {
        this.inputtedName = "";
        this.inputtedWallet = "";
      } else {
        this.$nextTick(() => {
          if (this.$refs.nameInput) {
            (this.$refs.nameInput as Vue)?.$el?.querySelector("input")?.focus();
          }
        });
      }
    },
    $route(_val, oldVal) {
      this.fromRoute = oldVal;
    },
  },
  mounted(): void {
    this.$accessor.contacts.requestStorageKey();
    if (this.$refs.searchInput) {
      (this.$refs.searchInput as Vue).$el?.querySelector("input")?.focus();
    }
  },
  methods: {
    addContact(): void {
      if (this.inputtedName.trim().length === 0) {
        this.modalError = "Name can't be empty";
      } else if (!this.inputtedWallet) {
        this.modalError = "Enter a valid wallet address";
      } else if (this.inputtedWallet.trim().toLowerCase() === this.walletAddressFull.toLowerCase()) {
        this.modalError = "You can't add your own account to contacts";
      } else {
        this.addContactModal = false;
        this.modalError = "";
        try {
          for (let a = this.contactsList.length - 1; a >= 0; a--) {
            const lowercaseContact = this.contactsList[a].address.toLowerCase();
            if ((this.addContactType === "edit" && lowercaseContact === this.editingWallet?.address.toLowerCase()) || lowercaseContact === this.inputtedWallet.toLowerCase()) {
              this.$accessor.contacts.deleteLocal(this.contactsList[a]);
              this.contactsList.splice(a, 1);
            }
          }
          this.contactsList.unshift({ name: this.inputtedName.trim(), address: this.inputtedWallet, deleted: false });
          const contact: ZkInContact = {
            name: this.inputtedName.trim(),
            address: this.inputtedWallet.toLowerCase(),
          };
          this.$accessor.contacts.saveContact(contact);
        } catch (error) {
          this.$sentry?.captureException(error);

          this.$toast.global.zkException({
            message: error.message ?? "Error while saving your contact book.",
          });
        }
        this.inputtedName = "";
        this.inputtedWallet = "";
      }
    },
    editContact(contact: ZkInContact): void {
      this.modalError = "";
      this.inputtedName = contact.name;
      this.inputtedWallet = contact.address;
      this.editingWallet = contact;
      this.addContactType = "edit";
      this.addContactModal = true;
    },
    deleteContact(): void {
      if (!this.editingWallet) {
        return;
      }
      const foundContact = this.$accessor.contacts.getByAddress(this.editingWallet.address);
      if (!foundContact) {
        this.$toast.global.zkException({
          message: `Contact with the address : ${this.editingWallet.address} not found`,
        });
        return;
      }
      this.$accessor.contacts.deleteContact(this.editingWallet.address);
      this.editingWallet.deleted = true;
      this.addContactModal = false;
      this.inputtedName = "";
      this.inputtedWallet = "";
      this.editingWallet = null;
    },
    restoreDeleted(contact?: ZkInContact): void {
      if (contact) {
        contact.deleted = false;
        this.$accessor.contacts.saveContact(contact);
      } else if (this.openedContact) {
        this.openedContact.deleted = false;
        this.$accessor.contacts.saveContact(this.openedContact);
      }
    },
    openContact(contact: ZkInContact): void {
      this.$router.push({ ...this.$route, query: { w: contact.address } });
    },
    copyAddress(address: Address): void {
      utils.copy(address);
    },
  },
});
</script>
