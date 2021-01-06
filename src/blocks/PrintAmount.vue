<template>
  <span class="tokenAmount">{{filteredValue}}</span>
</template>

<script>
export default {
  const: {
    in: {
      required: true,
    },
  },
  computed: {
    filteredValue: function () {
      console.log(typeof this.in);
      return this.in;
    },
  },
};
</script>
