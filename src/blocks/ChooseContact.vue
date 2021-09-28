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
          <div v-if="!isSearching && !hasDisplayedContacts && !displayOwnAddress" class="nothingFound">
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
            <div v-for="(item, contactAddress) in displayedContactsList" :key="contactAddress" class="contactItem" @click.self="chooseContact(item)">
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
      <i-column v-if="!contact && !isOwnAddress" :md="canSaveContact ? 7 : 12" xs="12">
        <i-button data-cy="address_block_select_from_contacts_button" block link variant="secondary" @click="contactsListModal = true">Select from contacts</i-button>
      </i-column>
      <i-column v-else xs="12" :md="canSaveContact ? 7 : 12">
        <i-button data-cy="address_block_select_from_contacts_button" block link variant="secondary" @click="contactsListModal = true">
          {{ isOwnAddress ? "Own account" : contact.name }}&nbsp;&nbsp;<v-icon name="ri-arrow-down-s-line" />
        </i-button>
      </i-column>
      <i-column xs="12" md="5">
        <i-button v-if="canSaveContact" block link variant="secondary" @click="saveContactModal = true"> Save to contacts</i-button>
      </i-column>
    </i-row>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { getAddress } from "ethers/lib/utils";
import { Address } from "zksync/build/types";
import { ZkContact, ZkContacts } from "matter-dapp-module/types";
import { searchInObject } from "matter-dapp-module/utils";

export default Vue.extend({
  props: {
    address: {
      type: String,
      default: undefined,
      required: false,
    } as PropOptions<Address>,
    displayOwnAddress: {
      type: Boolean,
      default: false,
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
      forceUpdateVal: Number.MIN_SAFE_INTEGER,
    };
  },
  computed: {
    ownAddress(): Address {
      return this.$store.getters["zk-account/address"];
    },
    isOwnAddress(): boolean {
      if (!this.address) {
        return false;
      }
      return this.$store.getters["zk-account/address"] === getAddress(this.address);
    },
    contact(): ZkContact | undefined {
      this.forceUpdateVal;
      if (!this.address) {
        return undefined;
      }
      return this.$store.getters["zk-contacts/contactByAddressNotDeleted"](this.address);
    },
    canSaveContact(): boolean {
      return Boolean(!this.contact && this.address && !this.isOwnAddress);
    },
    isSearching(): boolean {
      return !!this.contactSearch.trim();
    },
    contactsList(): ZkContacts {
      this.forceUpdateVal;
      return this.$store.getters["zk-contacts/contactsNotDeleted"];
    },
    displayedContactsList(): ZkContacts {
      this.forceUpdateVal;
      return <ZkContacts>searchInObject(this.contactsList, this.contactSearch, ([_, contact]: [string, ZkContact]) => `${contact.name} - ${contact.address}`);
    },
    hasDisplayedContacts(): boolean {
      return Object.keys(this.displayedContactsList).length !== 0;
    },
  },
  watch: {
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
    chooseContact(contact: ZkContact) {
      this.$emit("chosen", contact.address);
      this.contactsListModal = false;
    },
    saveContact() {
      if (this.saveContactInput.trim().length <= 0) {
        this.saveContactModalError = "Invalid name";
        return;
      }
      if (!this.address) {
        this.saveContactModalError = "Invalid address";
        return;
      }
      this.$store.dispatch("zk-contacts/setContact", { address: this.address, name: this.saveContactInput.trim() });
      this.saveContactInput = "";
      this.saveContactModal = false;
      this.forceUpdateVal++;
    },
  },
});
</script>
