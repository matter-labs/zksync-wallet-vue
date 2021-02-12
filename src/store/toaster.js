export const state = () => ({});

export const mutations = {};

export const getters = {};

export const actions = {
  message({ commit }, messageText) {
    this.$toast.show(messageText, {
      type: "default",
      duration: 3000,
    });
  },

  success({ commit }, messageText) {
    this.$toast.success(messageText, {
      duration: 3000,
      icon: {
        name: "fa-check",
      },
    });
    let configuration = {
      position: "bottom-right",

      type: "default",
      duration: 2000,
      messageText: "",
    };
    if (typeof params === "string") {
      configuration.messageText = params;
    } else {
      configuration = params;
    }
    this.$toast.show(configuration.messageText, {
      type: "default",
      duration: 3000,
      icon: {
        name: "fa-check",
      },
    });
  },

  error({ dispatch }, messageText) {
    console.log(messageText);
    this.$sentry.captureException(new Error(messageText));
  },

  info({ dispatch }, messageText) {
    this.$toast.info(messageText, {
      icon: {
        name: "fa-info-circle",
      },
      duration: 3000,
    });
  },
};
