<template>
  <transition name="modal">
    <div v-if="value || block" class="modalContainer" :class="{ full: !block }" @click.self="close()">
      <div class="modalMain">
        <closebtn v-if="!block && notClosable === false" @click="close()" />
        <div v-if="$slots['header']" class="modalHeader">
          <slot name="header" />
        </div>
        <div v-if="$slots['default']" class="modalBody">
          <slot name="default" />
        </div>
        <div v-if="$slots['footer']" class="modalFooter">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "vue";

import Closebtn from "../components/Closebtn.vue";
export default Vue.extend({
  components: {
    Closebtn,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
      required: false,
    },
    block: {
      type: Boolean,
      default: false,
      required: false,
    },
    notClosable: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  methods: {
    close() {
      if (this.notClosable) {
        return;
      }
      this.$emit("input", false);
      this.$emit("close");
    },
  },
});
</script>
