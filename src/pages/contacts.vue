<template>
  <div class="contactsPage">
    <i-modal v-model="addContactModal" class="prevent-close" size="md">
      <template slot="header">

        <span v-if="addContactType==='add'">{{$t("pages.contacts.add")}}</span>
        <span v-else-if="addContactType==='edit'">{{$t("pages.contacts.edit")}}</span>
      </template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input ref="nameInput" v-model="inputtedName" autofocus maxlength="20" placeholder="Name" size="lg" @keyup.enter="addContact()"/>
        <br>
        <div class="_padding-bottom-1">Address</div>
        <address-input ref="addressInput" v-model="inputtedWallet" @enter="addContact()"/>
        <br>
        <div v-if="modalError" class="modalError _padding-bottom-2">{{ modalError }}</div>
        <i-button v-if="addContactType==='edit'" block link size="md" variant="secondary" @click="deleteContact()"><i class="fas fa-trash"></i>&nbsp;&nbsp;Delete contact</i-button>
        <i-button block variant="secondary" size="lg" @click="addContact()">Save</i-button>
      </div>
    </i-modal>
    <div v-if="!openedContact" class="tileBlock contactTile">
      <div class="tileHeadline h3">
        <span>Contacts</span>
        <i-tooltip>
          <i class="fas fa-plus" @click="addContactType='add'; addContactModal=true;"></i>
          <template slot="body">Add contact</template>
        </i-tooltip>
      </div>
      <i-input v-if="search.trim() || displayedContactsList.length!==0" v-model="search" placeholder="Filter contacts" maxlength="20">
        <i slot="prefix" class="far fa-search"></i>
      </i-input>

      <div class="contactsListContainer">
        <div v-if="!search.trim() && displayedContactsList.length===0" class="nothingFound">
          <div>The contact list is empty</div>
          <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="addContactType='add'; addContactModal=true;">Add contact</i-button>
        </div>
        <div v-else-if="displayedContactsList.length===0" class="nothingFound">
          <span>Your search <b>"{{ search }}"</b> did not match any contacts</span>
        </div>
        <div v-for="(item, index) in displayedContactsList" v-else :key="index" class="contactItem" :class="{'deleted': item.deleted===true}" @click.self="openContact(item)">
          <user-img :wallet="item.address"/>
          <div class="contactInfo">
            <div class="contactName">{{ item.name }}</div>
            <div class="contactAddress walletAddress">{{ item.address }}</div>
          </div>
          <div v-if="!item.deleted" class="iconsBlock">
            <i-tooltip trigger="click">
              <i-button class="copyAddress" block link size="md" variant="secondary" @click="copyAddress(item.address)"><i class="fas fa-copy"></i></i-button>
              <template slot="body">Copied!</template>
            </i-tooltip>
            <i-button block link size="md" variant="secondary" @click="editContact(item)"><i class="fas fa-pen"></i></i-button>
          </div>
          <div v-else class="iconsBlock">
            <i-button block link size="md" variant="secondary" @click="restoreDeleted(item)"><i class="fas fa-trash-undo"></i></i-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="computedReturnLink" class="returnBtn">
          <i class="far fa-long-arrow-alt-left"/>
        </nuxt-link>
        <div>
          <span v-if="openedContact.notInContacts">{{ openedContact.address.replace(openedContact.address.slice(6, openedContact.address.length - 3), "...") }}</span>
          <span v-else>{{ openedContact.name }}</span>
        </div>
      </div>
      <div v-if="openedContact.deleted===true" class="isDeleted">Contact is deleted</div>
      <wallet-address :wallet="openedContact.address" class="_margin-y-1"/>
      <i-button
          v-if="openedContact.notInContacts" block link size="md" variant="secondary"
          @click="addContactType='add'; inputtedWallet=openedContact.address; addContactModal=true;"
      ><i class="fas fa-plus"></i>&nbsp;&nbsp;Add contact
      </i-button>
      <i-button v-else-if="openedContact.deleted===false" block link size="md" variant="secondary" @click="editContact(openedContact)"><i class="fas fa-pen"></i>&nbsp;&nbsp;Edit
        contact
      </i-button>
      <i-button v-else block link size="md" variant="secondary" @click="restoreDeleted(openedContact)"><i class="fas fa-trash-undo"></i>&nbsp;&nbsp;Restore contact</i-button>
      <i-button block size="lg" variant="secondary" :to="`/transfer?w=${openedContact.address}`"><i class="fas fa-paper-plane"></i>&nbsp;&nbsp;Transfer to contact</i-button>
    </div>
    <transactions v-if="openedContact" :address="openedContact.address" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Address, Contact } from '@/plugins/types'

import userImg from '@/components/userImg.vue'
import walletAddress from '@/components/walletAddress.vue'
import transactions from '@/blocks/Transactions.vue'
import addressInput from '@/components/AddressInput.vue'

export default Vue.extend({
  components: {
    userImg,
    walletAddress,
    transactions,
    addressInput,
  },
  asyncData ({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      search: '',
      addContactModal: false,
      addContactType: 'add',
      inputtedName: '',
      inputtedWallet: '',
      editingWallet: null as (Contact | null),
      modalError: '',
      contactsList: this.$store.getters['contacts/get'].map((e: Contact) => ({ ...e, deleted: false, notInContacts: false })) as Array<Contact>,
      fromRoute: {},
    };
  },
  computed: {
    computedReturnLink: function (): string {
      // @ts-ignore: Unreachable code error
      return (this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath && this.fromRoute.path !== "/transfer") ? this.fromRoute : "/contacts";
    },
    walletAddressFull: function (): string {
      return this.$store.getters['account/address'];
    },
    displayedContactsList: function (): Array<Contact> {
      if (!this.search.trim()) {
        return this.contactsList;
      }
      return this.contactsList.filter((e: Contact) => e.name.toLowerCase().includes(this.search.trim().toLowerCase()));
    },
    openedContact: function (): (null | Contact) {
      const wallet = this.$route.query.w;
      if (!wallet) {
        return null;
      }
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === String(wallet).toLowerCase()) {
          return this.contactsList[a];
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
        this.inputtedName = ''
        this.inputtedWallet = ''
      } else {
        this.$nextTick(() => {
          if (this.$refs.nameInput) {
            // @ts-ignore: Unreachable code error
            this.$refs.nameInput.$el.querySelector('input').focus()
          }
        })
      }
    },
    $route(val, oldVal) {
      this.fromRoute = oldVal;
    },
  },
  methods: {
    addContact: function () {
      if (this.inputtedName.trim().length === 0) {
        this.modalError = `Name can't be empty`
      } else if (!this.inputtedWallet) {
        this.modalError = `Enter a valid wallet address`
      } else if (this.inputtedWallet.trim().toLowerCase() === this.walletAddressFull.toLowerCase()) {
        this.modalError = `You can't add your own account to contacts`
      } else {
        this.addContactModal = false
        this.modalError = ''
        try {
          const addressToSearch = this.addContactType === 'add' ? this.inputtedWallet : (this.editingWallet?.address || '')
          for (let a = 0; a < this.contactsList.length; a++) {
            if (this.contactsList[a].address.toLowerCase() === addressToSearch.toLowerCase()) {
              this.contactsList.splice(a, 1)
              break
            }
          }
          this.contactsList.unshift({ name: this.inputtedName.trim(), address: this.inputtedWallet, deleted: false })
          this.$store.commit('contacts/saveContact', { name: this.inputtedName.trim(), address: this.inputtedWallet })
        } catch (error) {
          this.$store.dispatch('toaster/error', error.message ? error.message : 'Error while saving your contact book.')
          console.log(error)
        }
        this.inputtedName = ''
        this.inputtedWallet = ''
      }
    },
    editContact: function (contact: Contact) {
      this.modalError = ''
      this.inputtedName = contact.name
      this.inputtedWallet = contact.address
      this.editingWallet = contact
      this.addContactType = 'edit'
      this.addContactModal = true
    },
    deleteContact: function () {
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === this.editingWallet?.address.toLowerCase()) {
          this.contactsList[a].deleted = true
          this.$store.commit('contacts/deleteContact', this.contactsList[a].address)
          break
        }
      }
      this.addContactModal = false
      this.inputtedName = ''
      this.inputtedWallet = ''
      this.editingWallet = null
    },
    restoreDeleted: function (contact: Contact) {
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === contact.address.toLowerCase()) {
          this.$set(this.contactsList, a, { ...contact, deleted: false });
          this.$store.commit('contacts/saveContact', {name: contact.name, address: contact.address});
          break;
        }
      }
    },
    openContact: function (contact: Contact) {
      // @ts-ignore: Unreachable code error
      this.$router.push({ ...this.$route, query: { w: contact.address } });
    },
    copyAddress: function (address: Address) {
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
