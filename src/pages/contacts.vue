<template>
  <div class="contactsPage">
    <i-modal v-model="addContactModal" class="prevent-close" size="md">
      <template slot="header">
        <span v-if="addContactType === 'add'">{{ $t("pages.contacts.add") }}</span>
        <span v-else-if="addContactType === 'edit'">{{ $t("pages.contacts.edit") }}</span>
      </template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input ref="nameInput" v-model="inputtedName" autofocus maxlength="20" placeholder="Name" size="lg" @keyup.enter="addContact()" />
        <br />
        <div class="_padding-bottom-1">Address</div>
        <address-input ref="addressInput" v-model="inputtedWallet" @enter="addContact()" />
        <br />
        <div v-if="modalError" class="modalError _padding-bottom-2">{{ modalError }}</div>
        <i-button v-if="addContactType === 'edit'" block link size="md" variant="secondary" @click="deleteContact()"
          ><i class="ri-delete-bin-line"></i>&nbsp;&nbsp;Delete contact</i-button
        >
        <i-button block variant="secondary" size="lg" @click="addContact()">Save</i-button>
      </div>
    </i-modal>
    <div v-if="!openedContact" class="tileBlock contactTile">
      <div class="tileHeadline h3">
        <span>Contacts</span>
        <i-tooltip>
          <i
            class="ri-add-fill"
            @click="
              addContactType = 'add';
              addContactModal = true;
            "
          ></i>
          <template slot="body">Add contact</template>
        </i-tooltip>
      </div>
      <i-input v-if="search.trim() || displayedContactsList.length !== 0" ref="searchInput" v-model="search" placeholder="Filter contacts" autofocus maxlength="20">
        <i slot="prefix" class="ri-search-line" />
      </i-input>

      <div class="contactsListContainer">
        <div v-if="!search.trim() && displayedContactsList.length === 0" class="nothingFound">
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
            >Add contact</i-button
          >
        </div>
        <div v-else-if="displayedContactsList.length === 0" class="nothingFound">
          <span
            >Your search <b>"{{ search }}"</b> did not match any contacts</span
          >
        </div>
        <div v-for="(item, index) in displayedContactsList" v-else :key="index" class="contactItem" :class="{ deleted: item.deleted === true }" @click.self="openContact(item)">
          <user-img :wallet="item.address" />
          <div class="contactInfo">
            <div class="contactName">{{ item.name }}</div>
            <div class="contactAddress walletAddress">{{ item.address }}</div>
          </div>
          <div v-if="!item.deleted" class="iconsBlock">
            <i-tooltip trigger="click">
              <i-button class="copyAddress" block link size="md" variant="secondary" @click="copyAddress(item.address)"><i class="ri-clipboard-line"></i></i-button>
              <template slot="body">Copied!</template>
            </i-tooltip>
            <i-button block link size="md" variant="secondary" @click="editContact(item)"><i class="ri-pencil-fill"></i></i-button>
          </div>
          <div v-else class="iconsBlock">
            <i-button block link size="md" variant="secondary" @click="restoreDeleted(item)"><i class="ri-arrow-go-back-line"></i></i-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="computedReturnLink" class="returnBtn">
          <i class="ri-arrow-left-line" />
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
        ><i class="ri-add-line"></i>&nbsp;&nbsp;Add contact
      </i-button>
      <i-button v-else-if="openedContact.deleted === false" block link size="md" variant="secondary" @click="editContact(openedContact)"
        ><i class="ri-pencil-fill"></i>&nbsp;&nbsp;Edit contact
      </i-button>
      <i-button v-else block link size="md" variant="secondary" @click="restoreDeleted(openedContact)"><i class="ri-arrow-go-back-line"></i>&nbsp;&nbsp;Restore contact</i-button>
      <i-button block size="lg" variant="secondary" :to="`/transfer?w=${openedContact.address}`"><i class="ri-send-plane-fill"></i>&nbsp;&nbsp;Transfer to contact</i-button>
    </div>
    <transactions v-if="openedContact" :address="openedContact.address" />
  </div>
</template>

<script lang="ts">
import transactions from "@/blocks/Transactions.vue";
import addressInput from "@/components/AddressInput.vue";

import userImg from "@/components/userImg.vue";
import walletAddress from "@/components/walletAddress.vue";
import { Address, Contact } from "@/plugins/types";
import Vue from "vue";
/* import "vue-router/types/vue"; */

export default Vue.extend({
  components: {
    userImg,
    walletAddress,
    transactions,
    addressInput,
  },
  asyncData({ from }): any {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      search: "",
      addContactModal: false,
      addContactType: "add",
      inputtedName: "",
      inputtedWallet: "",
      editingWallet: null as Contact | null,
      modalError: "",
      contactsList: this.$accessor.contacts.get.map((e: Contact) => ({ ...e, deleted: false, notInContacts: false })) as Array<Contact>,
      fromRoute: {} as any,
    };
  },
  computed: {
    computedReturnLink(): string {
      return this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath && this.fromRoute?.path !== "/transfer" ? this.fromRoute : "/contacts";
    },
    walletAddressFull(): string {
      return this.$accessor.account.address;
    },
    displayedContactsList(): Array<Contact> {
      return !this.search.trim() ? this.contactsList : this.contactsList.filter((e: Contact) => e.name.toLowerCase().includes(this.search.trim().toLowerCase()));
    },
    openedContact(): null | Contact {
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
  },
  watch: {
    addContactModal(val: boolean) {
      if (!val) {
        this.inputtedName = "";
        this.inputtedWallet = "";
      } else {
        this.$nextTick(() => {
          if (this.$refs.nameInput) {
            // @ts-ignore: Unreachable code error
            this.$refs.nameInput?.$el?.querySelector("input").focus();
          }
        });
      }
    },
    $route(val, oldVal) {
      this.fromRoute = oldVal;
    },
  },
  mounted(): void {
    // @ts-ignore
    if (this.$refs.searchInput) {
      (this.$refs.searchInput as Vue).$el?.querySelector("input")?.focus();
    }
  },
  methods: {
    addContact() {
      if (this.inputtedName.trim().length === 0) {
        this.modalError = `Name can't be empty`;
      } else if (!this.inputtedWallet) {
        this.modalError = `Enter a valid wallet address`;
      } else if (this.inputtedWallet.trim().toLowerCase() === this.walletAddressFull.toLowerCase()) {
        this.modalError = `You can't add your own account to contacts`;
      } else {
        this.addContactModal = false;
        this.modalError = "";
        try {
          const addressToSearch = this.addContactType === "add" ? this.inputtedWallet : this.editingWallet?.address || "";
          for (let a = 0; a < this.contactsList.length; a++) {
            if (this.contactsList[a].address.toLowerCase() === addressToSearch.toLowerCase()) {
              this.contactsList.splice(a, 1);
              break;
            }
          }
          this.contactsList.unshift({ name: this.inputtedName.trim(), address: this.inputtedWallet, deleted: false });
          this.$accessor.contacts.saveContact({ name: this.inputtedName.trim(), address: this.inputtedWallet });
        } catch (error) {
          this.$accessor.toaster.error(error.message ? error.message : "Error while saving your contact book.");
        }
        this.inputtedName = "";
        this.inputtedWallet = "";
      }
    },
    editContact(contact: Contact) {
      this.modalError = "";
      this.inputtedName = contact.name;
      this.inputtedWallet = contact.address;
      this.editingWallet = contact;
      this.addContactType = "edit";
      this.addContactModal = true;
    },
    deleteContact() {
      for (const item of this.contactsList) {
        if (item.address.toLowerCase() === this.editingWallet?.address.toLowerCase()) {
          item.deleted = true;
          this.$accessor.contacts.deleteContact(item.address);
          break;
        }
      }
      this.addContactModal = false;
      this.inputtedName = "";
      this.inputtedWallet = "";
      this.editingWallet = null;
    },
    restoreDeleted(contact: Contact) {
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === contact.address.toLowerCase()) {
          this.$set(this.contactsList, a, { ...contact, deleted: false });
          this.$accessor.contacts.saveContact({ name: contact.name, address: contact.address });
          break;
        }
      }
    },
    openContact(contact: Contact) {
      // @ts-ignore
      this.$router.push({ ...this.$route, query: { w: contact.address } });
    },
    copyAddress(address: Address) {
      const elem = document.createElement("textarea");
      elem.style.position = "absolute";
      elem.style.left = -99999999 + "px";
      elem.style.top = -99999999 + "px";
      elem.value = address;
      document.body.appendChild(elem);
      elem.select();
      document.execCommand("copy");
      document.body.removeChild(elem);
    },
  },
});
</script>
