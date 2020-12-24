<template>
    <transition name="fade">
        <div id="nuxt-loading-custom" aria-live="polite" role="status" v-if="screenLoader"><div>Loading...</div></div>
    </transition>
</template>

<script>
export default {
    computed: {
        screenLoader: function() {
            return this.$store.getters['getScreenLoader'];
        }
    }
}
</script>