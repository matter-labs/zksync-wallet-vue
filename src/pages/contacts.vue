<template>
  <div class="contactsPage">
    <i-modal v-model="addContactModal" class="prevent-close" size="md">
      <template slot="header">
        <span v-if="addContactType==='add'">Add contact</span>
        <span v-else-if="addContactType==='edit'">Edit contact</span>
      </template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input v-model="inputedName" size="lg" placeholder="Name" maxlength="20"/>

        <br>

        <div class="_padding-bottom-1">Address</div>
        <i-input v-model="inputedWallet" size="lg" placeholder="0x address" maxlength="42"/>

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
          <span>The contact list is empty</span>
        </div>
        <div v-else-if="displayedContactsList.length===0" class="nothingFound">
          <span>Your search <b>"{{ search }}"</b> did not match any contacts</span>
        </div>
        <div v-for="(item, index) in displayedContactsList" v-else :key="index" class="contactItem" :class="{'deleted': item.deleted===true}" @click.self="openContact(item)">
          <user-img :wallet="item.address"/>
          <div class="contactInfo">
            <div class="contactName">{{ item.name }}</div>
            <div class="contactAddress">{{ item.address }}</div>
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
          <!-- <div class="rightSide">
              <div class="balance">{{item.balance}}</div>
          </div> -->
        </div>
      </div>
    </div>
    <div v-else class="tileBlock">
      <div class="tileHeadline h3">
        <span v-if="openedContact.notInContacts">{{ openedContact.address.replace(openedContact.address.slice(6, openedContact.address.length - 3), "...") }}</span>
        <span v-else>{{ openedContact.name }}</span>
        <i-tooltip>
          <i class="fas fa-times" @click="$router.push('/contacts')"></i>
          <template slot="body">Close</template>
        </i-tooltip>
      </div>
      <div v-if="openedContact.deleted===true" class="isDeleted">Contact is deleted</div>
      <wallet-address :wallet="openedContact.address" class="_margin-y-1"/>
      <i-button v-if="openedContact.notInContacts" block link size="md" variant="secondary"
                @click="addContactType='add'; inputedWallet=openedContact.address; addContactModal=true;"><i class="fas fa-plus"></i>&nbsp;&nbsp;Add contact
      </i-button>
      <i-button v-else-if="openedContact.deleted===false" block link size="md" variant="secondary" @click="editContact(openedContact)"><i class="fas fa-pen"></i>&nbsp;&nbsp;Edit
        contact
      </i-button>
      <i-button v-else block link size="md" variant="secondary" @click="restoreDeleted(openedContact)"><i class="fas fa-trash-undo"></i>&nbsp;&nbsp;Restore contact</i-button>
      <i-button block size="lg" variant="secondary" :to="`/transfer?w=${openedContact.address}`"><i class="fas fa-paper-plane"></i>&nbsp;&nbsp;Transfer to contact</i-button>
    </div>
  </div>
</template>

<script>
import validations from "@/plugins/validations.js";
import { walletData } from "@/plugins/walletData.js";
import userImg from "@/components/userImg.vue";
import walletAddress from "@/components/walletAddress.vue";

export default {
  components: {
    userImg,
    walletAddress,
  },
  data() {
    return {
      search: "",
      addContactModal: false,
      addContactType: "add",
      inputedName: "",
      inputedWallet: "",
      editingWallet: null,
      modalError: "",
      contactsList: [],
    };
  },
  computed: {
    walletAddressFull: function () {
      return walletData.get().syncWallet.address();
    },
    displayedContactsList: function () {
      if (!this.search.trim()) {
        return this.contactsList;
      }
      return this.contactsList.filter((e) => e.name.toLowerCase().includes(this.search.trim().toLowerCase()));
    },
    openedContact: function () {
      const wallet = this.$route.query.w;
      if (!wallet) {
        return null;
      }
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === wallet.toLowerCase()) {
          return this.contactsList[a];
        }
      }
      return {
        deleted: false,
        notInContacts: true,
        address: wallet,
        name: "",
      };
    },
  },
  watch: {
    addContactModal(val) {
      if (val === false) {
        this.inputedName = "";
        this.inputedWallet = "";
      }
    },
  },
  mounted() {
    try {
      if (process.client && window.localStorage.getItem("contacts-" + this.walletAddressFull)) {
        const contactsList = JSON.parse(window.localStorage.getItem("contacts-" + this.walletAddressFull));
        if (Array.isArray(contactsList)) {
          this.contactsList = contactsList.map((e) => ({ ...e, deleted: false }));
        } else {
          window.localStorage.setItem("contacts-" + this.walletAddressFull, JSON.stringify([]));
        }
      } else {
        window.localStorage.setItem("contacts-" + this.walletAddressFull, JSON.stringify([]));
      }
    } catch (error) {
      this.$store.dispatch("toaster/error", error.message ? error.message : "Error while fetching your contacts.");
    }
  },
  methods: {
    saveList: function () {
      const contactsList = JSON.parse(JSON.stringify(this.contactsList));
      for (let a = contactsList.length - 1; a >= 0; a--) {
        if (contactsList[a].deleted === false) {
          delete contactsList[a].deleted;
        } else {
          contactsList.splice(a, 1);
        }
      }
      if (process.client) {
        window.localStorage.setItem("contacts-" + this.walletAddressFull, JSON.stringify(contactsList));
      }
    },
    addContact: function () {
      if (this.inputedName.trim().length === 0) {
        this.modalError = `Name can't be empty`;
      } else if (this.inputedWallet.trim().length === 0) {
        this.modalError = `Wallet address can't be empty`;
      } else if (!validations.eth.test(this.inputedWallet)) {
        this.modalError = `"${this.inputedWallet}" doesn't match ethereum address format`;
      } else if (this.inputedWallet.trim().toLowerCase() === this.walletAddressFull.toLowerCase()) {
        this.modalError = `You can't add your own account to contacts`;
      } else {
        this.addContactModal = false;
        this.modalError = "";
        try {
          const addressToSearch = this.addContactType === "add" ? this.inputedWallet : this.editingWallet.address;
          for (let a = 0; a < this.contactsList.length; a++) {
            if (this.contactsList[a].address.toLowerCase() === addressToSearch.toLowerCase()) {
              this.contactsList.splice(a, 1);
              break;
            }
          }
          this.contactsList.push({ name: this.inputedName.trim(), address: this.inputedWallet, deleted: false });
          this.saveList();
        } catch (error) {
          this.$store.dispatch("toaster/error", error.message ? error.message : "Error while saving your contact book.");
          console.log(error);
        }
        this.inputedName = "";
        this.inputedWallet = "";
      }
    },
    editContact: function (contact) {
      this.modalError = "";
      this.inputedName = contact.name;
      this.inputedWallet = contact.address;
      this.editingWallet = contact;
      this.addContactType = "edit";
      this.addContactModal = true;
    },
    deleteContact: function () {
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === this.editingWallet.address.toLowerCase()) {
          this.contactsList[a].deleted = true;
          break;
        }
      }
      this.addContactModal = false;
      this.inputedName = "";
      this.inputedWallet = "";
      this.editingWallet = null;
      this.saveList();
    },
    restoreDeleted: function (contact) {
      for (let a = 0; a < this.contactsList.length; a++) {
        if (this.contactsList[a].address.toLowerCase() === contact.address.toLowerCase()) {
          this.$set(this.contactsList, a, { ...contact, deleted: false });
          break;
        }
      }
      this.saveList();
    },
    openContact: function (contact) {
      this.$router.push({ ...this.$route, query: { w: contact.address } });
    },
    copyAddress: function (address) {
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
};
</script>
