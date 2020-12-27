<template>
    <transition name="slide-vertical">
        <div v-if="confirmed===false" class="cookieContainer">
            <i-container class="cookieMain">
                <div class="text">We use cookies to ensure that we give you the best experience on our website.
                  If you continue without changing your settings, we'll assume that you are happy with it</div>
                <i-button block variant="secondary" size="lg" @click="cookieConfirm()">Accept</i-button>
            </i-container>
        </div>
    </transition>
</template>

<script>
import Cookies from "js-cookie";
export default {
  data() {
    return {
      confirmed: true,
    };
  },
  mounted() {
    this.checkCookie();
  },
  methods: {
    checkCookie: function () {
      this.confirmed = Cookies.get("accept-cookie") === "true";
    },
    cookieConfirm: function () {
      Cookies.set("accept-cookie", "true");
      this.confirmed = true;
    },
  },
};
</script>
