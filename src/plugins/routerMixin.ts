import Vue from "vue";
import { NavigationGuardNext, Route } from "vue-router";

const routerMixin = {
  data() {
    return {
      fromRoute: null,
    };
  },
  beforeRouteEnter(_to: Route, from: Route, next: NavigationGuardNext<Vue>) {
    next((vm) => {
      vm.fromRoute = from;
      for (const children of vm.$children) {
        children.fromRoute = from;
      }
    });
  },
};

Vue.mixin(routerMixin);
