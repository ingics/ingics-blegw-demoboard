/*
export function someAction (context) {
}
*/

export function setBeaconTTL ({ commit }, value) {
    console.log(`action setBeaconTTL ${value}`)
    commit('setBeaconTTL', value)
}
