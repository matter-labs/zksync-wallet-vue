<template>
  <div class="socialIcons">
    <a title="Blog" href="https://zksync.mirror.xyz/" class="socialItem" target="_blank">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3.5 9.51613C3.5 4.8128 7.30558 1 12 1C16.6944 1 20.5 4.8128 20.5 9.51613V21.7059C20.5 22.4206 19.9217 23 19.2083 23H4.79167C4.0783 23 3.5 22.4206 3.5 21.7059V9.51613Z"
          fill="currentColor"
        ></path>
      </svg>
    </a>
    <a title="Discord Community" href="https://join.zksync.dev/" class="socialItem" target="_blank">
      <v-icon name="ri-discord-fill" class="ri-discord-fill" />
    </a>
    <a title="Telegram Community" href="https://t.me/zksync" class="socialItem" target="_blank">
      <v-icon name="fa-telegram-plane" class="fa-telegram-plane" />
    </a>
    <a title="Twitter Community" href="https://twitter.com/zksync" class="socialItem" target="_blank">
      <v-icon name="bi-twitter" class="bi-twitter" />
    </a>
    <a
      v-if="location !== 'footer'"
      title="All Contacts"
      href="https://docs.lite.zksync.io/contact.html"
      class="socialItem"
      target="_blank"
    >
      <v-icon name="ri-at-line" class="ri-at-line" />
    </a>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

type Location = "header" | "footer";

export default Vue.extend({
  props: {
    location: {
      required: false,
      type: String as PropType<Location>,
      default: "header",
    },
  },
});
</script>
