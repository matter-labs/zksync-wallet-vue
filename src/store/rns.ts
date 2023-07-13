import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import Vue from "vue";
import { AddrResolver } from "@rsksmart/rns-sdk";

const addrResolver = new AddrResolver(
  process.env.RNS_REGISTRY_ADDRESS || "0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5",
  process.env.RNS_REGISTRY_NODE || "https://public-node.rsk.co"
);

const ethKey = "crypto.RBTC.address";

type DomainState = {
  supportedTlds: Array<string>;
  domainData: Map<string, any>;
};
export const state = (): DomainState => ({
  supportedTlds: ["rsk"],
  domainData: Object.create(null),
});
export const getters = getterTree(state, {
  getDomain:
    (state: DomainState) =>
    (address: string, ticker: string = "RBTC") => {
      const key = "crypto." + ticker + ".address";
      const domainWithTicker = state.domainData[address]?.[key];
      return domainWithTicker || state.domainData[address]?.[ethKey];
    },
  getSupportedTld: (state: DomainState) => state.supportedTlds,
  getDomainData: (state: DomainState) => state.domainData,
});

export const mutations = mutationTree(state, {
  setSupportedTlds(state: DomainState, supportedTlds: string[]): void {
    Vue.set(state, "supportedTlds", supportedTlds);
  },
  setDomainData(state: DomainState, { address, domainData }: { address: string; domainData: any }): void {
    Vue.set(state.domainData, address, domainData);
  },
  clear(state: DomainState) {
    Vue.set(state, "supportedTlds", []);
    Vue.set(state, "domainData", new Map());
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async lookupDomain({ commit, getters }, { address }: { address: string; ticker: string }) {
      try {
        const domain = address ? address.trim().toLowerCase() : "";
        const supportedTlds = getters.getSupportedTld;
        const isValidDomain = supportedTlds?.some((tld) => domain.endsWith(tld)) ?? false;
        if (isValidDomain) {
          const addr = await addrResolver.addr(domain);
          commit("setDomainData", {
            address: domain,
            domainData: { "crypto.RBTC.address": addr },
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
  }
);

// This compiles to nothing and only serves to return the correct type of the accessor
export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {},
});
