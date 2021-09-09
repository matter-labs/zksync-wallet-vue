import { networkOptions, NetworkConfigOption, getCurrentNetworkConfig } from "@/plugins/config";

import { actionTree, getterTree, mutationTree } from "typed-vuex";

const LOCAL_STORAGE_NETWORK_CONFIG = "zkSyncNetwork";

export const state = () => ({
  options: networkOptions,

  network: getCurrentNetworkConfig(),
});

export type ConfigModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {});

export const getters = getterTree(state, {
  isMainnet: (state: ConfigModuleState): boolean => {
    return state.network?.name === "mainnet";
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    changeNetworkConfig(_, option: NetworkConfigOption): void {
      localStorage.setItem(LOCAL_STORAGE_NETWORK_CONFIG, option.name);
      window.location.reload();
    },
  },
);
