<template>
  <div class="socialIcons">
    <a v-for="(socialProfile, numIndex) in socialNetworks" :key="numIndex" :href="socialProfile.url" class="socialItem" target="_blank">
      <i v-if="socialProfile.icon" :class="socialProfile.icon" />
      <div v-else-if="socialProfile.img" class="svgContainer" v-html="socialIcons[socialProfile.img]"></div>
    </a>
  </div>
</template>

<script>
import socialIcons from "@/plugins/socialIcons";
export default {
  props: {
    location: {
      required: false,
      type: String,
      default: "header",
    },
  },
  data() {
    return {
      socialIcons,
    };
  },
  computed: {
    socialNetworks() {
      const socialIcons = [
        {
          name: "Medium Blog",
          img: "medium",
          url: "https://medium.com/matter-labs",
        },
        {
          name: "Gitter Rooms",
          img: "gitter",
          url: "https://gitter.im/matter-labs/zksync",
        },
        {
          name: "Discord Community",
          img: "discord",
          url: "https://discord.com/invite/px2aR7w",
        },
        {
          name: "Telegram Community",
          img: "telegram",
          url: "https://t.me/zksync",
        },
        {
          name: "Twitter Community",
          img: "twitter",
          url: "https://twitter.com/zksync",
        },
        {
          name: "All Contacts",
          icon: "ri-at-line",
          url: "/contact.html",
          hideIn: "footer",
        },
      ];
      return socialIcons.filter((item) => !item.hideIn || item.hideIn !== this.location);
    },
  },
};
</script>
