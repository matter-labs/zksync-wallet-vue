<template>
  <div class="chooseContactBlock">
    <!-- Contacts list -->
    <i-modal v-model="contactsListModal" size="md">
      <template slot="header">Contacts</template>
      <div>
        <i-input v-if="isSearching || hasDisplayedContacts" ref="contactNameInput" v-model="contactSearch" placeholder="Filter contacts" maxlength="20">
          <v-icon slot="prefix" name="ri-search-line" />
        </i-input>
        <div class="contactsListContainer genericListContainer">
          <div v-if="!isSearching && !hasDisplayedContacts" class="nothingFound">
            <span>The contact list is empty</span>
          </div>
          <div v-else-if="isSearching && !hasDisplayedContacts" class="nothingFound _padding-top-2 _padding-bottom-1">
            <span>
              Your search <b>"{{ contactSearch }}"</b> did not match any contacts
            </span>
          </div>
          <template v-else>
            <div v-if="!isSearching && displayOwnAddress" class="contactItem" @click.self="chooseContact({ name: 'Own account', address: ownAddress })">
              <user-img :wallet="ownAddress" />
              <div class="contactInfo">
                <div class="contactName">Own account</div>
                <div class="contactAddress walletAddress">{{ ownAddress }}</div>
              </div>
            </div>
            <div v-for="(item, index) in displayedContactsList" :key="index" class="contactItem" @click.self="chooseContact(item)">
              <user-img :wallet="item.address" />
              <div class="contactInfo">
                <div class="contactName">{{ item.name }}</div>
                <div class="contactAddress walletAddress">{{ item.address }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </i-modal>

    <!-- Save contact -->
    <i-modal v-model="saveContactModal" class="prevent-close" size="md">
      <template slot="header">Save contact</template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input ref="saveContactNameInput" v-model="saveContactInput" size="lg" placeholder="Name" maxlength="20" @keyup.enter="saveContact()" />
        <div v-if="saveContactModalError" class="modalError _margin-top-1">{{ saveContactModalError }}</div>
        <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>

    <!-- Main -->
    <i-row class="_margin-top-md-1">
      <i-column v-if="!chosenContact || (!chosenContact.name && !isOwnAddress)" :md="canSaveContact ? 7 : 12" xs="12">
        <i-button block link variant="secondary" @click="contactsListModal = true">Select from contacts</i-button>
      </i-column>
      <i-column v-else xs="12" :md="canSaveContact ? 7 : 12">
        <i-button block link variant="secondary" @click="contactsListModal = true">
          {{ isOwnAddress ? "Own account" : chosenContact.name }}&nbsp;&nbsp;<v-icon name="ri-arrow-down-s-line" />
        </i-button>
      </i-column>
      <i-column xs="12" md="5">
        <i-button v-if="canSaveContact" block link variant="secondary" @click="saveContactModal = true"> Save to contacts</i-button>
      </i-column>
    </i-row>
  </div>
</template>

<script lang="ts">
import utils from "@/plugins/utils";
import { ZkInContact } from "@/types/lib";
import { Address } from "zksync/build/types";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    address: {
      type: String,
      default: undefined,
      required: false,
    } as PropOptions<Address>,
    displayOwnAddress: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  data() {
    return {
      /* Contacts list */
      contactsListModal: false,
      contactSearch: "",

      /* Save contact */
      saveContactModal: false,
      saveContactInput: "",
      saveContactModalError: "",

      /* Main */
      chosenContact: <ZkInContact | false>false,
    };
  },
  computed: {
    ownAddress(): Address {
      return this.$accessor.account.address || "";
    },
    canSaveContact(): boolean {
      return !this.isInContacts && !!this.chosenContact && !!this.chosenContact.address && !this.chosenContact.name && !this.isOwnAddress;
    },
    isOwnAddress(): boolean {
      if (this.chosenContact && this.chosenContact.address) {
        return this.ownAddress.toLowerCase() === this.chosenContact.address.toLowerCase();
      } else {
        return false;
      }
    },
    contactsList(): Array<ZkInContact> {
      return this.$accessor.contacts.get;
    },
    displayedContactsList(): Array<ZkInContact> {
      if (!this.isSearching) {
        return this.contactsList;
      }
      return utils.searchInArr(this.contactSearch, this.contactsList, (e) => (e as ZkInContact).name) as ZkInContact[];
    },
    isInContacts(): boolean {
      return this.chosenContact && this.chosenContact.address ? this.checkAddressInContacts(this.chosenContact.address) : false;
    },
    hasDisplayedContacts(): boolean {
      return this.displayedContactsList.length !== 0 || this.displayOwnAddress;
    },
    isSearching(): boolean {
      return !!this.contactSearch.trim();
    },
  },
  watch: {
    chosenContact: {
      deep: true,
      handler(val) {
        this.$emit("input", val);
      },
    },
    address: {
      immediate: true,
      handler(val) {
        this.chooseContact({
          address: val,
          name: "",
        });
      },
    },

    contactsListModal() {
      setTimeout(() => {
        (this.$refs.contactNameInput as Vue)?.$el?.querySelector("input")?.focus();
      }, 0);
    },
    saveContactModal() {
      this.saveContactModalError = "";
      setTimeout(() => {
        (this.$refs.contactNameInput as Vue)?.$el?.querySelector("input")?.focus();
      }, 0);
    },
  },
  methods: {
    chooseContact(contact?: ZkInContact): void {
      if (!contact?.address) {
        this.chosenContact = false;
        return;
      }
      if (!contact?.name) {
        const foundContact = this.$accessor.contacts.getByAddress(contact.address);
        if (foundContact) {
          contact = foundContact;
        }
      }
      this.chosenContact = contact;
      this.contactsListModal = false;
    },
    checkAddressInContacts(address: Address): boolean {
      return this.$accessor.contacts.isInContacts(address);
    },
    saveContact(): void {
      if (this.saveContactInput.trim().length <= 0) {
        this.saveContactModalError = "Name can't be empty";
        return;
      }
      if (this.chosenContact) {
        const contact = {
          name: this.saveContactInput,
          address: this.chosenContact.address,
        };
        this.$accessor.contacts.saveContact(contact);
        this.chooseContact(contact);
      }
      this.saveContactInput = "";
      this.saveContactModal = false;
    },
  },
});
</script>
