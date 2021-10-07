<template>
  <div class="contactsPage dappPageWrapper">
    <i-modal v-model="contactModal.enabled" class="prevent-close" size="md">
      <template slot="header">
        <span v-if="!openedContact">Add contact</span>
        <span v-else>Edit contact</span>
      </template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input ref="nameInput" v-model="contactModal.name" autofocus maxlength="20" placeholder="Name" size="lg" @keyup.enter="saveContact()" />
        <br />
        <div v-if="contactModal.error" class="modalError _padding-bottom-2">{{ contactModal.error }}</div>
        <i-button v-if="openedContact" block link size="md" variant="secondary" @click="deleteContact()"><v-icon name="ri-delete-bin-line" />&nbsp;&nbsp;Delete contact</i-button>
        <i-button block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>
    <div class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="computedReturnLink" class="returnBtn">
          <v-icon name="ri-arrow-left-line" />
        </nuxt-link>
        <div>
          <span>{{ computedName }}</span>
        </div>
      </div>
      <div v-if="openedContact && openedContact.deleted === true" class="isDeleted">Contact is deleted</div>
      <wallet-address :wallet="address" class="_margin-y-1" />
      <i-button v-if="!openedContact" block link size="md" variant="secondary" @click="addToContacts()"><v-icon name="ri-add-circle-fill" />&nbsp;&nbsp;Add to contacts</i-button>
      <i-button v-else-if="!openedContact.deleted" block link size="md" variant="secondary" @click="editContact()">
        <v-icon name="ri-pencil-fill" />&nbsp;&nbsp;Edit contact
      </i-button>
      <i-button v-else block link size="md" variant="secondary" @click="restoreDeleted()"><v-icon name="ri-arrow-go-back-line" />&nbsp;&nbsp;Restore contact</i-button>
      <i-button block size="lg" variant="secondary" :to="`/transaction/transfer?address=${address}`">
        <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer to address
      </i-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router/types";
import { Address } from "zksync/build/types";
import { getAddress } from "ethers/lib/utils";
import { ZkContact } from "matter-dapp-module/types";

export default Vue.extend({
  asyncData({ from, params }) {
    return {
      fromRoute: from,
      address: params.address,
    };
  },
  data() {
    return {
      fromRoute: <Route | undefined>undefined,
      address: <Address>"",
      contactModal: {
        enabled: false,
        error: "",
        name: "",
      },
      forceUpdateVal: Number.MIN_SAFE_INTEGER,
    };
  },
  fetch({ params, redirect }) {
    if (!params.address || !getAddress(params.address)) {
      return redirect("/contacts");
    }
  },
  computed: {
    computedReturnLink(): Route | string {
      return this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath && this.fromRoute.path !== "/transaction/transfer" ? this.fromRoute : "/contacts";
    },
    openedContact(): ZkContact {
      this.forceUpdateVal;
      return this.$store.getters["zk-contacts/contactByAddress"](this.address);
    },
    computedName(): string {
      if (this.openedContact) {
        return this.openedContact.name;
      }
      return this.address.substr(0, 5) + "..." + this.address.substr(this.address.length - 5, this.address.length - 1);
    },
  },
  methods: {
    addToContacts() {
      this.contactModal = {
        enabled: true,
        error: "",
        name: "",
      };
    },
    editContact() {
      this.contactModal = {
        enabled: true,
        error: "",
        name: this.openedContact.name,
      };
    },
    saveContact() {
      if (this.contactModal.name.trim().length <= 0) {
        this.contactModal.error = "Invalid name";
        return;
      }
      this.$store.dispatch("zk-contacts/setContact", { address: this.address, name: this.contactModal.name });
      this.contactModal.enabled = false;
      this.forceUpdateVal++;
    },
    deleteContact() {
      this.$store.dispatch("zk-contacts/removeContact", this.address);
      this.contactModal.enabled = false;
      this.forceUpdateVal++;
    },
    restoreDeleted() {
      this.$store.dispatch("zk-contacts/setContact", { address: this.openedContact.address, name: this.openedContact.name });
      this.contactModal.enabled = false;
      this.forceUpdateVal++;
    },
  },
});
</script>
