/**
 * Custom accessor for the Typed-vuex
 */
import { getAccessorType } from "typed-vuex";
import { accessorType } from "@/store";

import * as store from "@/store";
import * as transaction from "~/store/transaction";

export const accessorForPlugins = getAccessorType({
  ...store,
  modules: {
    transaction,
  },
}) as typeof accessorType;
