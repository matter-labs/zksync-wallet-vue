<template>
  <header class="indexHeader" :class="{'opened': opened}">
    <div class="mainIndexHeader">
      <i-container>
        <i-row>
          <i-column :xs="12" :md="4" class="_padding-left-0">
            <a href="http://zksync.io/" target="_blank"><logo/></a>
          </i-column>
          <i-column :xs="12" :md="4" class="_padding-y-0">
            <div class="linksContainer">
              <a href="/faq/" target="_blank" class="linkItem">FAQ</a>
              <a href="/dev/" target="_blank" class="linkItem">Docs</a>
              <i-dropdown class="_background-transparent _border-none likeLinkItem" :class="{'opened': dropdownOpened}" size="sm" variation="dark" placement="bottom" trigger="manual">
                <a class="dropDownHandler linkItem _position-top-0" @click.capture="dropdownOpened = !dropdownOpened">zkTools <i class="fal" :class="dropdownOpened?'fa-chevron-up':'fa-chevron-down'"/></a>
                <i-dropdown-menu v-model="dropdownOpened">
                  <i-dropdown-item v-for="(item, index) in dropdownOptions" :key="index" :href="item.link" target="_blank">{{item.name}}</i-dropdown-item>
                </i-dropdown-menu>
              </i-dropdown>
              <a href="https://matter-labs.io/#jobs" target="_blank" class="linkItem">We're hiring</a>
            </div>
          </i-column>
          <i-column :xs="12" :md="4" class="_margin-left-auto _padding-right-0 _justify-content-end desktopOnly">
            <social-block/>
          </i-column>
        </i-row>
      </i-container>
    </div>
  </header>
</template>

<script lang="ts">
import logo from "@/blocks/Logo.vue";
import SocialBlock from "@/blocks/SocialBlock.vue";
import Vue from "vue";

interface DropdownOption {
  name: string;
  link: string;
}

export default Vue.extend({
  components: {
    logo,
    SocialBlock,
  },
  data() {
    return {
      opened: false,
      showLogo: true,
      dropdownOpened: false,
      dropdownOptions: [
        {
          name: "zkWallet",
          link: "https://wallet.zksync.io/",
        },
        {
          name: "zkLink",
          link: "https://link.zksync.io/",
        },
        {
          name: "zkScan",
          link: "https://zkscan.io/",
        },
        {
          name: "Alternative Withdrawal",
          link: "https://withdraw.zksync.io/",
        },
        {
          name: "zkCheckout",
          link: "https://www.npmjs.com/package/zksync-checkout/",
        },
      ] as Array<DropdownOption>,
    };
  },
  beforeMount() {
    if (process.client && window.pageXOffset < 768) {
      window.addEventListener("scroll", this.handleScroll);
    }
  },
  beforeDestroy() {
    if (process.client && window.pageXOffset < 768) {
      window.removeEventListener("scroll", this.handleScroll);
    }
  },
  methods: {
    handleScroll() {
      this.showLogo = window.pageYOffset > 300;
    },
  },
});
</script>
