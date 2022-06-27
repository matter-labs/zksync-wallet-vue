<template>
  <div class="socialIcons">
    <a
      v-for="socialProfile in socialNetworks"
      :key="socialProfile.name"
      :href="socialProfile.url"
      class="socialItem"
      target="_blank"
    >
      <v-icon :name="socialProfile.icon" :class="[socialProfile.icon]" />
    </a>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

type SingleIcon = {
  name: string;
  icon: string;
  url: string;
  hideIn?: string;
};

type Location = "header" | "footer";

export default Vue.extend({
  props: {
    location: {
      required: false,
      type: String as PropType<Location>,
      default: "header",
    },
  },
  data() {
    return {
      socialProfiles: [
        {
          name: "Medium Blog",
          icon: "fa-medium-m",
          url: "https://medium.com/matter-labs",
        },
        {
          name: "Discord Community",
          icon: "ri-discord-fill",
          url: "https://discord.com/invite/px2aR7w",
        },
        {
          name: "Telegram Community",
          icon: "fa-telegram-plane",
          url: "https://t.me/zksync",
        },
        {
          name: "Twitter Community",
          icon: "bi-twitter",
          url: "https://twitter.com/zksync",
        },
        {
          name: "All Contacts",
          icon: "ri-at-line",
          url: "https://zksync.io/contact.html",
          hideIn: "footer",
        },
      ] as SingleIcon[],
    };
  },
  computed: {
    socialNetworks(): SingleIcon[] {
      return this.socialProfiles.filter((item: SingleIcon) => item?.hideIn !== this.location);
    },
  },
});
</script>
