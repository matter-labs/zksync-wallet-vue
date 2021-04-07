<template>
  <transaction :from-route="fromRoute" type="withdraw" />
</template>

<script lang="ts">
import Transaction from "@/blocks/Transaction.vue";
import { Vue } from "vue-property-decorator";

export default Vue.extend({
  components: {
    Transaction,
  },
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
});
</script>
