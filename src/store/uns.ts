import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import Vue from "vue";

const resolutionService = "https://resolve.unstoppabledomains.com/domains/";
const tldAPI = "https://resolve.unstoppabledomains.com/supported_tlds";
const ethKey = "crypto.ETH.address";

type UnsState = {
  supportedTlds: Array<string>;
  domainData: Map<string, any>;
};
export const state = (): UnsState => ({
  supportedTlds: [],
  domainData: Object.create(null),
});
export const getters = getterTree(state, {
  getDomain:
    (state: UnsState) =>
    (address: string, ticker: string = "ETH") => {
      const key = "crypto." + ticker + ".address";
      const domainWithTicker = state.domainData[address]?.[key];
      return domainWithTicker || state.domainData[address]?.[ethKey];
    },
  getSupportedTld: (state: UnsState) => state.supportedTlds,
  getDomainData: (state: UnsState) => state.domainData,
});

export const mutations = mutationTree(state, {
  setSupportedTlds(state: UnsState, supportedTlds: string[]): void {
    Vue.set(state, "supportedTlds", supportedTlds);
  },
  setDomainData(state: UnsState, { address, domainData }: { address: string; domainData: any }): void {
    Vue.set(state.domainData, address, domainData);
  },
  clear(state: UnsState) {
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
        let supportedTlds = getters.getSupportedTld;
        if (supportedTlds.length === 0) {
          const response = await fetch(tldAPI);
          const data = await response.json();
          if (data.tlds) {
            supportedTlds = data.tlds;
            commit("setSupportedTlds", supportedTlds);
          }
        }
        const isValidDomain = supportedTlds?.some((tld) => domain.endsWith(tld)) ?? false;
        if (isValidDomain) {
          const response = await fetch(resolutionService + domain, {
            method: "get",
            headers: new Headers({
              Authorization: "Bearer " + process.env.UNS_KEY,
            }),
          });
          const data = await response.json();
          if (data.records) {
            commit("setDomainData", { address: domain, domainData: data.records });
          }
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
