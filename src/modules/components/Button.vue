<template>
  <button v-if="!to" class="defbtn" :class="[outline === true ? 'outline' : 'filled']" v-on="$listeners">
    <slot />
    <loader v-if="loader" size="xs" :color="outline === true ? 'gray' : 'white'" />
  </button>
  <nuxt-link v-else :to="to" class="defbtn" :class="[outline === true ? 'outline' : 'filled']" v-on="$listeners">
    <slot />
    <loader v-if="loader" size="xs" :color="outline === true ? 'gray' : 'white'" />
  </nuxt-link>
</template>

<script lang="ts">
import Vue from "vue";
import Loader from "./Loader.vue";
export default Vue.extend({
  components: {
    Loader,
  },
  props: {
    outline: {
      default: false,
      type: Boolean,
      required: false,
    },
    loader: {
      default: false,
      type: Boolean,
      required: false,
    },
    to: {
      default: "",
      type: String,
      required: false,
    },
  },
});
</script>
