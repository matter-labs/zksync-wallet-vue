<template>
    <div class="alert">
        <i class="alertIcon fal fa-info-square"></i>
        <div class="slotContainer">
            <slot />
        </div>
        <i @click="close()" class="alertCloseIcon fal fa-times"></i>
    </div>
</template>

<script>
export default {
    methods: {
        close: function() {
            this.$destroy();
            this.$el.parentNode.removeChild(this.$el);
        }
    },
}
</script>