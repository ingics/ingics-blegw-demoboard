/*
export function someAction (context) {
}
*/

export function save ({ commit, state }, cfg) {
    console.log('action:', 'save')
    commit('save', cfg)
}
