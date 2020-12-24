<template>
    <div class="alert">
        <i class="alertIcon fal fa-info-square"></i>
        <div class="slotContainer">
            <slot />
        </div>
        <i class="alertCloseIcon fal fa-times" @click="close()"></i>
    </div>
</template>

<script>
export default {
  methods: {
    close: function () {
      this.$destroy();
      this.$el.parentNode.removeChild(this.$el);
    },
  },
};
</script>
