<template>
    <div class="addressInput">
        <div class="walletContainer inputWallet" :class="{'error': error}" @click.self="focusInput()">
            <user-img :wallet="inputedWallet" v-if="isValid" />
            <div class="userImgPlaceholder userImg" v-else></div>
            <input ref="input" class="walletAddress" autocomplete="none" spellcheck="false" placeholder="0x address" type="text" maxlength="45" v-model="inputedWallet" @keyup.enter="$emit('enter')">
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import utils from '@/plugins/utils';

import userImg from '@/components/userImg.vue';
export default Vue.extend({
    props: {
        value: {
            type: String,
            default: "",
            required: false,
        },
    },
    data() {
        return {
            inputedWallet: this.value?this.value:'',
        }
    },
    watch: {
        inputedWallet(val) {
            const trimmed = val.trim();
            this.inputedWallet=trimmed;
            if(val!==trimmed) {
                return;
            }
            if(this.isValid) {
                this.$emit('input', val);
            }
            else {
                this.$emit('input', '');
            }
        },
        value(val) {
            if(this.isValid || (!this.isValid && !!val)) {
                this.inputedWallet=val;
            }
        }
    },
    components: {
        userImg,
    },
    computed: {
        isValid: function(): boolean {
            return utils.validateAddress(this.inputedWallet);
        },
        error: function(): string {
            if(this.inputedWallet && !this.isValid) {
                return 'Invalid address';
            }
            else {
                return '';
            }
        }
    },
    methods: {
        focusInput: function(): void {
            if(this.$refs.input) {
                // @ts-ignore: Unreachable code error
                this.$refs.input.focus();
            }
        },
    },
});
</script>