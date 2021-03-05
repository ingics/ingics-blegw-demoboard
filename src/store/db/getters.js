/*
export function someGetter (state) {
}
*/

export function beacon (state) {
    return function (mac) {
        return state.beacons.find(v => v.mac === mac)
    }
}
