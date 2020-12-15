<template>
    <div class="animtedCheckmark">

    </div>
</template>

<script>
import lottie from "lottie-web";
import successCheckmark from '@/plugins/successCheckmark.json';
export default {
    methods: {
        loadAnimation() {
            let anim = lottie.loadAnimation({
                container: this.$el,
                autoplay: true,
                loop: false,
                width: '200px',
                height: '200px',
                animationData: successCheckmark
            });
        }
    },
    mounted() {
        this.loadAnimation();
    },
}
</script>