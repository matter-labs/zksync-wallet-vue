<template>
    <div class="fieldGroup">
        <div v-if="label" class="label">
            {{label}}
        </div>
        <div class="fieldsSlot">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
      required: false,
    },
  },
};
</script>
