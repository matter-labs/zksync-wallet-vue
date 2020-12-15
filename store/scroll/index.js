export const state = () => ({
    lastScroll: false,
    lastPath: '',
});

export const mutations = {
    setLastScroll(state, lastScroll) {
        if(!lastScroll) {
            state.lastScroll=false;
        }
        else {
            state.lastScroll=lastScroll;
        }
    },
    setLastPath(state, lastPath) {
        state.lastPath=lastPath;
    },
};

export const getters = {
    getLastScroll(state) {
        return state.lastScroll;
    },
    getLastPath(state) {
        return state.lastPath;
    },
}

export const actions = {
    
}