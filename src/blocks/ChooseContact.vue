<template>
  <div class="chooseContactBlock">
    <!-- Contacts list -->
    <i-modal v-model="contactsListModal" size="md">
      <template slot="header">Contacts</template>
      <div>
        <i-input v-if="contactSearch.trim() || displayedContactsList.length !== 0" ref="contactNameInput" v-model="contactSearch" placeholder="Filter contacts" maxlength="20">
          <i slot="prefix" class="far fa-search"></i>
        </i-input>
        <div class="contactsListContainer">
          <div v-if="!contactSearch.trim() && displayedContactsList.length === 0 && !displayOwnAddress" class="nothingFound">
            <span>The contact list is empty</span>
          </div>
          <div v-else-if="contactSearch.trim() && displayedContactsList.length === 0 && !displayOwnAddress" class="nothingFound _padding-top-2 _padding-bottom-1">
            <span
              >Your search <b>"{{ contactSearch }}"</b> did not match any contacts</span
            >
          </div>
          <template v-else>
            <div v-if="!contactSearch.trim() && displayOwnAddress" class="contactItem" @click.self="chooseContact({ name: 'Own account', address: ownAddress })">
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
    <i-row class="_margin-top-1">
      <i-column v-if="!chosenContact || (!chosenContact.name && !isOwnAddress)" :md="canSaveContact ? 7 : 12" xs="12">
        <i-button block link variant="secondary" @click="contactsListModal = true">Select from contacts</i-button>
      </i-column>
      <i-column v-else xs="12" :md="canSaveContact ? 7 : 12">
        <i-button block link variant="secondary" @click="contactsListModal = true">
          {{ isOwnAddress ? "Own account" : chosenContact.name }}&nbsp;&nbsp;<i class="far fa-angle-down" />
        </i-button>
      </i-column>
      <i-column xs="12" md="5">
        <i-button v-if="canSaveContact" block link variant="secondary" @click="saveContactModal = true"> Save to contacts</i-button>
      </i-column>
    </i-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Address, Contact } from "@/plugins/types";
import userImg from "@/components/userImg.vue";

export default Vue.extend({
  components: {
    userImg,
  },
  props: {
    address: {
      type: String,
      default: undefined,
      required: false,
    },
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
      chosenContact: false as false | Contact,
    };
  },
  computed: {
    ownAddress(): Address {
      return this.$store.getters["account/address"];
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
    contactsList(): Array<Contact> {
      return this.$store.getters["contacts/get"];
    },
    displayedContactsList(): Array<Contact> {
      if (!this.contactSearch.trim()) {
        return this.contactsList;
      }
      const lowerCaseInput = this.contactSearch.trim().toLowerCase();
      return this.contactsList.filter((e) => e.name.toLowerCase().includes(lowerCaseInput));
    },
    isInContacts(): boolean {
      if (this.chosenContact && this.chosenContact.address) {
        return this.checkAddressInContacts(this.chosenContact.address);
      } else {
        return false;
      }
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
        // @ts-ignore: Unreachable code error
        this.$refs.contactNameInput?.$el?.querySelector("input")?.focus();
      }, 0);
    },
    saveContactModal() {
      this.saveContactModalError = "";
      setTimeout(() => {
        // @ts-ignore: Unreachable code error
        this.$refs.saveContactNameInput?.$el?.querySelector("input")?.focus();
      }, 0);
    },
  },
  methods: {
    chooseContact(contact: Contact): void {
      if (!contact.address) {
        this.chosenContact = false;
        return;
      }
      if (!contact.name) {
        if (this.checkAddressInContacts(contact.address)) {
          contact = this.$store.getters["contacts/getByAddress"](contact.address);
        }
      }
      this.chosenContact = contact;
      this.contactsListModal = false;
    },
    checkAddressInContacts(address: Address): boolean {
      return this.$store.getters["contacts/isInContacts"](address);
    },
    saveContact(): void {
      if (this.saveContactInput.trim().length <= 0) {
        this.saveContactModalError = "Name can't be empty";
        return;
      }
      const contact = {
        name: this.saveContactInput,
        address: (this.chosenContact as Contact).address,
      };
      this.$store.commit("contacts/saveContact", contact);
      this.chooseContact(contact);
      this.saveContactInput = "";
      this.saveContactModal = false;
    },
  },
});
</script>
