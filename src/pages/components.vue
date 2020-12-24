<template>
    <i-container class="_margin-top-5 _padding-bottom-3">
        <div style="max-width: 500px; margin: 0 auto;">

            <i-row class="_margin-top-2">
                <amount-input placeholder="14.3400" loading>
                    <template slot="pre">
                        LINK
                    </template>
                    <template slot="hints">
                        <div class="hint">
                            <i class="fal fa-exclamation-circle"></i>
                            The unlock procedure may take 1-3 minutes, please keep patience....
                        </div>
                    </template>
                </amount-input>
            </i-row>
            <i-row class="_margin-top-2">
                <amount-input placeholder="14.3400" disabled :min="14.3400">
                    <template slot="pre">
                        LINK
                    </template>
                </amount-input>
            </i-row>
            <i-row class="_margin-top-2">
                <amount-input v-model="testInput" placeholder="14.3400" :min="14.3400" :max="20.321">
                    <template slot="pre">
                        LINK
                    </template>
                </amount-input>
            </i-row>
            <i-row class="_margin-top-2">
                <amount-input v-model="testInput" placeholder="14.3400" success>
                    <template slot="pre">
                        LINK
                    </template>
                    <template slot="hints">
                        <div class="hint green">
                            Your token successfully stored in L2
                        </div>
                    </template>
                </amount-input>
            </i-row>

            <div class="_margin-top-4">
                <i-row>
                    <i-column>
                        <button class="customButton">Deposit</button>
                    </i-column>
                    <i-column>
                        <button class="customButton" disabled><i class="fal fa-ban"></i> Deposit</button>
                    </i-column>
                </i-row>
                <i-row class="_margin-top-1">
                    <i-column>
                        <button class="customButton red"><i class="fal fa-comment-alt-dots"></i> Need Help</button>
                    </i-column>
                    <i-column>
                        <button class="customButton outline"><i class="fad fa-spinner-third"></i> Loading</button>
                    </i-column>
                </i-row>
            </div>

            <div class="_margin-top-4">
                <i-row>
                    <alert>Use perfect opprtunity to save up on gas, here and now!<br>Find out how in brief popup tooltip.</alert>
                </i-row>
            </div>
            <div class="_margin-top-4">
                <i-row>
                    <fields-group label="Asset / Amount">
                        <amount-input v-model="testInput" placeholder="14.3400" disabled loading>
                            <template slot="pre">
                                LINK
                            </template>
                            <template slot="hints">
                                <div class="hint">
                                    <i class="fal fa-exclamation-circle"></i>
                                    The unlock procedure may take 1-3 minutes, please keep patience....
                                </div>
                            </template>
                        </amount-input>
                        <div class="totalSum">
                            <div class="headline">Sum in $</div>
                            <div class="value">135.74</div>
                            <div class="source">© Coinmarketcup.io</div>
                        </div>
                        <button class="customButton" disabled><i class="fad fa-spinner-third"></i> Loading</button>
                    </fields-group>
                </i-row>
            </div>

        </div>
    </i-container>
</template>

<script>
import amountInput from "@/components/custom/input.vue";
import fieldsGroup from "@/components/custom/fieldsGroup.vue";
import alert from "@/components/custom/alert.vue";
export default {
  components: {
    amountInput,
    fieldsGroup,
    alert,
  },
  layout: "index",
  data() {
    return {
      testInput: 10.0,
    };
  },
};
</script>
