<template>
  <div class="walletPage">
    <i-modal v-model="walletInfoModal" size="md">
      <template slot="header">Wallet information</template>
      <div>
        <div>
          <b>Your zkSync address is the same as your Ethereum account address.</b>
        </div>
        <p>
          As long as you control your Ethereum account you also own all the L2 balances under its address in zkSync.
          Nobody can freeze or take them away from you. Once your balance has been verified (), you can always recover
          your tokens from zkSync — even if its validators are ever shut down. <a
            href="//zksync.io/faq/security.html"
            rel="noopener noreferrer"
            target="_blank"
        >Learn
         more.</a>
        </p>
      </div>
    </i-modal>
    <div class="tileBlock">
      <div class="tileHeadline h3">
        <span>My wallet</span>
        <i class="fas fa-question" @click="walletInfoModal=true"></i>
      </div>
      <wallet-address class="clickablePicture" :wallet="walletAddress" @clickPicture="openAccountModal()"/>
    </div>
    <balances/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import balances from '@/blocks/Balances.vue'
import walletAddress from '@/components/walletAddress.vue'

export default Vue.extend({
  components: {
    walletAddress,
    balances,
  },
  data () {
    return {
      walletInfoModal: false,
    }
  },
  computed: {
    walletAddress: function () {
      return this.$store.getters['account/address']
    },
  },
  methods: {
    openAccountModal: function () {
      this.$store.commit('setAccountModalState', true)
    },
  },
})
</script>
