<template>
    <div class="tileBlock tokensTile">
      <div class="tileHeadline h3">
        <span>Balances in L2</span>
        <i-tooltip>
          <i class="fas fa-times" @click="$emit('selectToken')"></i>
          <template slot="body">Close</template>
        </i-tooltip>
      </div>
      <div v-if="tokensLoading===true" class="nothingFound">
        <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'"/>
      </div>
      <template v-else>
        <i-input v-model="tokenSearch" placeholder="Filter balances in L2" maxlength="10">
          <i slot="prefix" class="far fa-search"></i>
        </i-input>
        <div class="tokenListContainer">
          <div v-for="item in displayedTokenList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
            <div class="tokenLabel">{{ item.symbol }}</div>
            <div class="rightSide">
              <div class="balance">{{ item.formatedBalance }}</div>
            </div>
          </div>
          <div v-if="tokenSearch && displayedTokenList.length===0" class="nothingFound">
            <span>Your search <b>"{{ tokenSearch }}"</b> did not match any tokens</span>
          </div>
          <div v-else-if="displayedTokenList.length===0" class="nothingFound">
            <span>No balances yet. Please make a deposit or request money from someone!</span>
          </div>
        </div>
      </template>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            required: false
        },
    },
    data() {
        return {
            tokenSearch: "",
            tokensList: [],
            tokensLoading: false,
            choosedToken: false,
        }
    },
    computed: {
        displayedTokenList: function () {
            if (!this.tokenSearch.trim()) {
                return this.tokensList;
            }
            return this.tokensList.filter((e) => (e.symbol.toLowerCase().includes(this.tokenSearch.trim().toLowerCase())));
        },
    },
    methods: {
        formatMax: function (val) {
            if (val === undefined) {
                return 0;
            }
            val = String(val).toString();
            let parts = val.split(".");
            if (parts.length > 1) {
                if (parts[1].length > 8) {
                    parts[1] = parts[1].substr(0, 8);
                }
            }
            return parseFloat(parts.join("."));
        },
        getTokensList: async function() {
            this.tokensLoading = true;
            try {
                const balances = await this.$store.dispatch("wallet/getzkBalances");
                this.tokensList = balances.filter(e=>e.restricted===false).map((e) => ({ ...e, balance: this.formatMax(e.balance) }));
            } catch (error) {
                console.log(error);
            }
            this.tokensLoading = false;
        },
        chooseToken: function(token) {
            this.$emit('input', token);
            this.$emit('selectToken');
        },
    },
    mounted() {
        this.getTokensList();
    },
}
</script>