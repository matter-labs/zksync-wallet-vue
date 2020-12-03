<template>
    <div class="fieldGroup">
        <div class="label" v-if="label">
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
            default: '',
            required: false
        }
    },
}
</script>