import { CONSTAT_IDLE } from './constants'

export function connect ({ commit, state }) {
    if (state.status === CONSTAT_IDLE) {
        commit('connect')
    }
}

export function disconnect ({ commit, state }) {
    if (state.status !== CONSTAT_IDLE) {
        commit('disconnect')
    }
}
