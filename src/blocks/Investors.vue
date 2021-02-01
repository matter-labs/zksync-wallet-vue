<template>
    <div class="investorsContainer" ref="container">
        <!-- <div class="overlay"></div> -->
        <div class="imgItem" :class="item[2]" v-for="(item, index) in imgs" :key="index">
            <img :src="require(`~/assets/imgs/investors/${item[0]}`)" :alt="item[1]" />
        </div>
    </div>
</template>

<script>
export default {
    layout: 'clear',
    data() {
        return {
            imgs: [
                ['binance.png','binance','horizontal','https://www.binance.com/'], ['1kx.png','1kx','horizontal','http://1kx.network/'], ['argent.png','argent','horizontal','https://www.argent.xyz/'],
                ['coinbase.png','coinbase','horizontal','https://www.coinbase.com/'], ['curve.png','curve','vertical','https://www.curve.fi/'], ['dragonfly.png','dragonfly','horizontal','https://www.dcp.capital/'],
                ['flexa.png','flexa','horizontal','https://flexa.network/'], ['huobi.webp','huobi','horizontal','https://www.huobi.com/'], ['imtoken.png','imtoken','vertical','https://token.im/'],
                ['loopring.png','loopring','horizontal','https://loopring.org/'], ['moonpay.png','moonpay','horizontal','https://www.moonpay.com/'], ['paraswap.png','paraswap','horizontal','https://paraswap.io/'],
                ['placeholder.png','placeholder','horizontal','https://www.placeholder.vc/'], ['ripio.png','ripio','horizontal','https://ripiocredit.network/'], ['smth1.png','smth1','vertical','#'],
                ['smth2.png','smth2','vertical','#'], ['synthetix.png','synthetix','vertical','https://synthetix.io/'], ['usv.jpg','usv','vertical','https://www.usv.com/'],
                ['dekrypt.png','dekrypt','horizontal','https://dekrypt.capital/'], ['ethereumFoundation.png','ethereumFoundation','horizontal','https://ethereum.org/en/foundation/'], ['hashed.png','hashed','horizontal','https://www.hashed.com/'],
                ['CoinGecko.png','CoinGecko','horizontal','https://www.coingecko.com/'], ['1inch.png','1inch','vertical','https://1inch.exchange/'], ['smth3.png','smth3','vertical','#'],
            ]
        }
    },
}
</script>