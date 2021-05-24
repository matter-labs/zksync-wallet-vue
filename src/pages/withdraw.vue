<template>
  <transaction :from-route="fromRoute" type="withdraw" />
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";

export default Vue.extend({
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
});
</script>
