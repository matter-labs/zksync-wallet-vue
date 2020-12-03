<template>
    <div class="contactsPage">
        <i-modal v-model="addContactModal" size="md">
            <template slot="header">
                <span v-if="addContactType==='add'">Add contact</span>
                <span v-else-if="addContactType==='edit'">Edit contact</span>
            </template>
            <div>
                <div class="_padding-bottom-1">Contact name</div>
                <i-input size="lg" v-model="inputedName" placeholder="Name" maxlength="20" />

                <br>

                <div class="_padding-bottom-1">Address</div>
                <i-input size="lg" v-model="inputedWallet" placeholder="0x address" maxlength="42" />
                
                <br>

                <div class="modalError _padding-bottom-2" v-if="modalError">{{modalError}}</div>

                <i-button block link size="md" variant="secondary" @click="deleteContact()" v-if="addContactType==='edit'"><i class="fal fa-trash"></i>&nbsp;&nbsp;Delete contact</i-button>
                <i-button block variant="secondary" size="lg" @click="addContact()">Save</i-button>
            </div>
        </i-modal>
        <div class="tileBlock contactTile" v-if="!openedContact">
            <div class="tileHeadline h3">
                <span>Contacts</span>
                <i-tooltip>
                    <i @click="addContactType='add'; addContactModal=true;" class="fas fa-plus"></i>
                    <template slot="body">Add contact</template>
                </i-tooltip>
            </div>
            <i-input v-model="search" placeholder="Filter contacts" v-if="search.trim() || displayedContactsList.length!==0">
                <i slot="prefix" class="far fa-search"></i>
            </i-input>
            
            <div class="contactsListContainer">
                <div class="nothingFound" v-if="!search.trim() && displayedContactsList.length===0">
                    <span>The contact list is empty</span>
                </div>
                <div class="nothingFound" v-else-if="displayedContactsList.length===0">
                    <span>Your search <b>"{{search}}"</b> did not match any contacts</span>
                </div>
                <div class="contactItem" :class="{'deleted': item.deleted===true}" v-for="(item, index) in displayedContactsList" :key="index" @click.self="openContact(item)" v-else>
                    <user-img :wallet="item.address" />
                    <div class="contactInfo">
                        <div class="contactName">{{item.name}}</div>
                        <div class="contactAddress">{{item.address}}</div>
                    </div>
                    <div class="iconsBlock" v-if="!item.deleted">
                        <i-button class="copyAddress" block link size="md" variant="secondary" @click="copyAddress(item.address)"><i class="fal fa-copy"></i></i-button>
                        <i-button block link size="md" variant="secondary" @click="editContact(item)"><i class="fal fa-pen"></i></i-button>
                    </div>
                    <div class="iconsBlock" v-else>
                        <i-button block link size="md" variant="secondary" @click="restoreDeleted(item)"><i class="fal fa-trash-undo"></i></i-button>
                    </div>
                    <!-- <div class="rightSide">
                        <div class="balance">{{item.balance}}</div>
                    </div> -->
                </div>
            </div>
        </div>
        <div class="tileBlock" v-else>
            <div class="tileHeadline h3">
                <span v-if="openedContact.notInContacts">{{openedContact.address.replace(openedContact.address.slice(6, openedContact.address.length - 3), '...')}}</span>
                <span v-else>{{openedContact.name}}</span>
                <i-tooltip>
                    <i @click="$router.push('/contacts')" class="fas fa-times"></i>
                    <template slot="body">Close</template>
                </i-tooltip>
            </div>
            <div class="isDeleted" v-if="openedContact.deleted===true">Contact is deleted</div>
            <wallet-address :wallet="openedContact.address" class="_margin-y-1" />
            <i-button block link size="md" variant="secondary" @click="addContactType='add'; inputedWallet=openedContact.address; addContactModal=true;" v-if="openedContact.notInContacts"><i class="fal fa-plus"></i>&nbsp;&nbsp;Add contact</i-button>
            <i-button block link size="md" variant="secondary" @click="editContact(openedContact)" v-else-if="openedContact.deleted===false"><i class="fal fa-pen"></i>&nbsp;&nbsp;Edit contact</i-button>
            <i-button block link size="md" variant="secondary" @click="restoreDeleted(openedContact)" v-else><i class="fal fa-trash-undo"></i>&nbsp;&nbsp;Restore contact</i-button>
            <i-button block size="lg" variant="secondary"><i class="fal fa-paper-plane"></i>&nbsp;&nbsp;Transfer to contact</i-button>
        </div>
    </div>
</template>

<script>
import validations from '@/plugins/validations.js';
import walletData from '@/plugins/walletData.js';
import userImg from '@/components/userImg.vue';
import walletAddress from '@/components/walletAddress.vue';
export default {
    data() {
        return {
            search: '',
            addContactModal: false,
            addContactType: 'add',
            inputedName: '',
            inputedWallet: '',
            editingWallet: null,
            modalError: '',
            contactsList: [],
        }
    },
    components: {
        userImg,
        walletAddress
    },
    computed: {
        walletAddressFull: function() {
            return walletData.get().syncWallet.address();
        },
        displayedContactsList: function() {
            if(!this.search.trim()){
                return this.contactsList;
            }
            return this.contactsList.filter(e=>e.name.toLowerCase().includes(this.search.trim().toLowerCase()));
        },
        openedContact: function() {
            const wallet = this.$route.query.w;
            if(!wallet){return null}
            for(let a=0; a<this.contactsList.length; a++) {
                if(this.contactsList[a].address===wallet) {
                    return this.contactsList[a];
                }
            }
            return {
                deleted: false,
                notInContacts: true,
                address: wallet,
                name: '',
            }
        },
    },
    methods: {
        saveList: function() {
            var contactsList = JSON.parse(JSON.stringify(this.contactsList));
            for(let a=contactsList.length-1; a>=0; a--) {
                if(contactsList[a].deleted===false) {
                    delete contactsList[a].deleted;
                }
                else {
                    contactsList.splice(a,1);
                }
            }
            window.localStorage.setItem('contacts-'+this.walletAddressFull, JSON.stringify(contactsList));
        },
        addContact: function() {
            if(this.inputedName.trim().length===0) {
                this.modalError=`Name can't be empty`
            }
            else if(this.inputedWallet.trim().length===0) {
                this.modalError=`Wallet address can't be empty`
            }
            else if(!validations.eth.test(this.inputedWallet)) {
                this.modalError=`"${this.inputedWallet}" doesn't match ethereum address format`
            }
            else {
                this.addContactModal = false;
                this.modalError = '';
                try {
                    const addressToSearch = this.addContactType==='add'?this.inputedWallet:this.editingWallet.address;
                    for(let a=0; a<this.contactsList.length; a++) {
                        if(this.contactsList[a].address===addressToSearch) {
                            this.contactsList.splice(a,1);
                            break;
                        }
                    }
                    this.contactsList.push({name: this.inputedName.trim(), address: this.inputedWallet, deleted: false});
                    this.saveList();
                } catch (error) {
                    console.log(error);
                }
                this.inputedName = '';
                this.inputedWallet = '';
            }
        },
        editContact: function(contact) {
            this.inputedName=contact.name;
            this.inputedWallet=contact.address;
            this.editingWallet=contact;
            this.addContactType='edit';
            this.addContactModal=true;
        },
        deleteContact: function() {
            for(let a=0; a<this.contactsList.length; a++) {
                if(this.contactsList[a].address===this.editingWallet.address) {
                    this.contactsList[a].deleted=true;
                    break;
                }
            }
            this.addContactModal=false;
            this.inputedName='';
            this.inputedWallet='';
            this.editingWallet=null;
            this.saveList();
        },
        restoreDeleted: function(contact) {
            for(let a=0; a<this.contactsList.length; a++) {
                if(this.contactsList[a].address===contact.address) {
                    this.$set(this.contactsList, a, {...contact, deleted: false});
                    break;
                }
            }
            this.saveList();
        },
        openContact: function(contact) {
            this.$router.push({...this.$route,query:{w:contact.address}});
        },
        copyAddress: function(address) {
            const elem = document.createElement('textarea');
            elem.style.position = 'absolute';
            elem.style.left = -99999999+'px';
            elem.style.top = -99999999+'px';
            elem.value = address;
            document.body.appendChild(elem);
            elem.select();
            document.execCommand('copy');
            document.body.removeChild(elem);
        }
    },
    mounted() {
        try {
            if(window.localStorage.getItem('contacts-'+this.walletAddressFull)) {
                var contactsList = JSON.parse(window.localStorage.getItem('contacts-'+this.walletAddressFull));
                if(Array.isArray(contactsList)) {
                    this.contactsList=contactsList.map(e => ({...e, deleted: false}));
                }
                else {
                    window.localStorage.setItem('contacts-'+this.walletAddressFull,JSON.stringify([]));
                }
            }
            else {
                window.localStorage.setItem('contacts-'+this.walletAddressFull,JSON.stringify([]));
            }
        } catch (error) {
            console.log(error);
        }
    },
}
</script>