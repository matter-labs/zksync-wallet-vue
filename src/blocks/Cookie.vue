<template>
    <transition name="slide-vertical">
        <div class="cookieContainer" v-if="confirmed===false">
            <i-container class="cookieMain">
                <div class="text">We use cookies to ensure that we give you the best experience on our website. If you continue without changing your settings, we'll assume that you are happy with it</div>
                <i-button block variant="secondary" size="lg" @click="cookieConfirm()">Accept</i-button>
            </i-container>
        </div>
    </transition>
</template>

<script>
import Cookies from 'js-cookie';
export default {
    data() {
        return {
            confirmed: true,
        }
    },
    methods: {
        checkCookie: function() {
            if(Cookies.get('accept-cookie')==='true') {
                this.confirmed=true;
            }
            else {
                this.confirmed=false;
            }
        },
        cookieConfirm: function() {
            Cookies.set('accept-cookie', 'true');
            this.confirmed=true;
        }
    },
    mounted() {
        this.checkCookie();
    },
}
</script>