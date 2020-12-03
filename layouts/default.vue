<template>
  <div class="defaultLayout">
    <header-component />
    <div class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <footer-component/>
  </div>
</template>

<script>
import headerComponent from '@/blocks/Header.vue'
import footerComponent from '@/blocks/Footer.vue'
export default {
  components: {
    headerComponent,
    footerComponent
  },
  watch: {
    '$route': {
      immediate: true,
      handler(val, oldVal) {
        if(!oldVal){
          return this.$nextTick(()=>{
            document.documentElement.scrollTop=0;
          });
        }
        if(val.path!==oldVal.path) {
          this.$nextTick(()=>{
            let lastScroll = this.$store.getters['scroll/getLastScroll'];
            document.documentElement.scrollTop=lastScroll!==false?lastScroll.y:0;
          });
        }
      },
    }
  },
  computed: {
    screenLoader: function () {
      return this.$store.getters.getScreenLoader
    },
  },
  mounted () {
    if (process.client) {
      window.history.scrollRestoration = 'manual';
    }
  },
}
</script>
