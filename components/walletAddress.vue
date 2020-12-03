<template>
    <div class="walletContainer">
        <user-img :wallet="wallet" />
        <span class="walletValue">{{wallet}}</span>
        <i-tooltip>
            <i class="copy fas fa-copy" @click="copyAddress()"></i>
            <template slot="body">Copy</template>
        </i-tooltip>
    </div>
</template>

<script>
import userImg from '@/components/userImg.vue';
export default {
    props: {
        wallet: {
            type: String,
            default: '',
            required: true,
        }
    },
    components: {
        userImg
    },
    methods: {
        copyAddress: function() {
            const elem = document.createElement('textarea');
            elem.style.position = 'absolute';
            elem.style.left = -99999999+'px';
            elem.style.top = -99999999+'px';
            elem.value = this.wallet;
            document.body.appendChild(elem);
            elem.select();
            document.execCommand('copy');
            document.body.removeChild(elem);
        }
    },
}
</script>