import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";

export declare interface iAccount {
  address?: Address;
  name?: string;
}

export const state = (): iAccount => ({
  address: undefined,
  name: undefined,
});

function getNameFromAddress(userAddress: Address): string {
  const walletName: string = window.localStorage.getItem(userAddress) || "";
  if (walletName.trim().length > 1 && walletName !== userAddress) {
    return walletName;
  }
  return userAddress.substr(0, 5) + "..." + userAddress.substr(userAddress.length - 5, userAddress.length - 1);
}

export type AccountModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAddress(state: AccountModuleState, address?: Address): void {
    state.address = address;
  },
  setName(state: AccountModuleState, name?: string): void {
    if (state.address !== undefined) {
      if (!name) {
        if (!state.name) {
          name = window.localStorage.getItem(state.address) as string;
        }
        name = getNameFromAddress(state.address);
        window.localStorage.removeItem(state.address);
      }
      window.localStorage.setItem(state.address, name);
      state.name = getNameFromAddress(state.address);
    }
  },
});

export const getters = getterTree(state, {
  address: (state: AccountModuleState): Address | undefined => state.address,
  name: (state: AccountModuleState): string | undefined => state.name,
  zkScanUrl: (state: AccountModuleState): string | undefined => (state.address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.address}` : undefined),
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    processLogin: ({ commit }, address?: Address | string) => {
      if (address) {
        commit("setAddress", address as Address);
        commit("setName", undefined);
      }
    },
  },
);
