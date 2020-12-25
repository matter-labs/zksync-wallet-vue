<template>
    <transition name="fade">
        <div class="screenLoaderContainer" v-if="screenLoader">
            <h1>Logging in {{logginInWith ? `with ${logginInWith}` : ''}}</h1>
            <div class="loaderSpinner">Loading...</div>
            <i-button class="cancelButton" block variant="secondary" size="lg" @click="cancelLogin()">Cancel</i-button>
        </div>
    </transition>
</template>

<script>
var getNameInterval = false;
var intervalRemoveTimeout = false;
export default {
    data() {
        return {
            logginInWith: false,
        }
    },
    computed: {
        screenLoader: function() {
            return this.$store.getters['getScreenLoader'];
        }
    },
    watch: {
        screenLoader(val) {
            if(val===true) {
                getNameInterval = setInterval(() => {
                    this.logginInWith = localStorage.getItem('selectedWallet');
                }, 50);
                intervalRemoveTimeout = setTimeout(() => {
                    clearInterval(getNameInterval);
                }, 500);
            }
            else {
                clearInterval(getNameInterval);
                clearTimeout(intervalRemoveTimeout);
            }
        }
    },
    methods: {
        cancelLogin: function() {
            this.$store.dispatch('wallet/logout');
            this.$router.push('/');
            this.$store.commit('hideLoader');
        }
    },
    beforeDestroy() {
        clearInterval(getNameInterval);
        clearTimeout(intervalRemoveTimeout);
    },
}
</script>
