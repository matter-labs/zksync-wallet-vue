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
          url: "https://medium.com/@RSKNews",
        },
        {
          name: "Discord Community",
          icon: "ri-discord-fill",
          url: "https://discord.com/invite/fPerbqcWGE",
        },
        {
          name: "Telegram Community",
          icon: "fa-telegram-plane",
          url: "https://t.me/rif_os_community",
        },
        {
          name: "Twitter Community",
          icon: "bi-twitter",
          url: "https://twitter.com/rif_os",
        },
        {
          name: "All Contacts",
          icon: "ri-at-line",
          url: "https://share.hsforms.com/12SzCTRAlRm61Oo2CLyBN4g1noi4",
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
