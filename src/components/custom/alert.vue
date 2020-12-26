<template>
    <div class="alert">
        <i class="alertIcon fas fa-info-square"></i>
        <div class="slotContainer">
            <slot />
        </div>
        <i class="alertCloseIcon fas fa-times" @click="close()"></i>
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
