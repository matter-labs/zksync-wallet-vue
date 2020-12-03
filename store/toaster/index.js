/**
 * Toaster wrapper to simplify and control rendering process
 *
 * @returns {{toasterIsActive: boolean}}
 */
export const state = () => ({
  toasterIsActive: false,
})

export const mutations = {
  /**
   * Set the toaster state
   * @param state
   * @param newToasterState
   */
  setState (state, newToasterState) {
    state.toasterIsActive = newToasterState
  },
}

export const getters = {
  isActive (state) {
    return state.toasterIsActive
  },
}

export const actions = {
  /**
   * Common method to render a toaster notification
   */
  showToaster: function ({ commit }, { messageText }) {
    commit('setState', true)
    this.$toast.error(messageText, {
      icon: {
        name: 'fa-times-circle',
      },
      position: 'bottom-right',
      action: {
        text: 'OK',
        onClick: (e, toastObject) => {
          toastObject.goAway(100)
        },
      },
    })
  },

  /**
   * Trigger an error toast-notification
   *
   * @param dispatch
   * @param messageText
   * @returns {Promise<void>}
   * @constructor
   */
  ERROR ({ dispatch }, messageText) {
    dispatch('showToaster', { messageText })
  },
}
