import { ActionTree } from "vuex";
import { RootState } from "~/store";

export const state = () => ({});

export type ToasterModuleState = ReturnType<typeof state>;

export const actions: ActionTree<ToasterModuleState, RootState> = {
  message({ commit }, messageText) {
    // @ts-ignore: Unreachable code error
    this.$toast.show(messageText, {
      type: "default",
      duration: 3000,
    });
  },

  success({ commit }, messageText) {
    // @ts-ignore: Unreachable code error
    this.$toast.success(messageText, {
      duration: 3000,
      icon: {
        name: "fa-check",
      },
    });
    const configuration = {
      position: "bottom-right",

      type: "default",
      duration: 2000,
      messageText: "",
    };
    /* if (typeof params === "string") {
      configuration.messageText = params;
    } else {
      configuration = params;
    } */
    // @ts-ignore: Unreachable code error
    this.$toast.show(configuration.messageText, {
      type: "default",
      duration: 3000,
      icon: {
        name: "fa-check",
      },
    });
  },

  error({ dispatch }, messageText) {
    // @ts-ignore: Unreachable code error
    this.$sentry.captureException(new Error(messageText));
  },

  info({ dispatch }, messageText) {
    // @ts-ignore: Unreachable code error
    this.$toast.info(messageText, {
      icon: {
        name: "fa-info-circle",
      },
      duration: 3000,
    });
  },
};
