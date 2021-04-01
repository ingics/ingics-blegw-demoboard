import { CONSTAT_ERROR, CONSTAT_IDLE, CONSTAT_OK } from './constants'

export function connected (state) {
    state.status = CONSTAT_OK
    state.error = null
}

export function disconnected (state) {
    if (state.status !== CONSTAT_ERROR) {
        state.status = CONSTAT_IDLE
    }
}

export function error (state, error) {
    state.status = CONSTAT_ERROR
    state.error = error
}

export function ended (state) {
    state.status = CONSTAT_IDLE
    state.error = null
    state.pause = false
}

export function pause (state) {
    if (state.status === CONSTAT_OK) {
        state.pause = !state.pause
    }
}

export function connect (state) {
    // do nothing here
    // the client plugins will handle it
}

export function disconnect (state) {
    // do nothing here
    // the client plugins will handle it
}

export function message (state) {
    // do nothing here
    // the database plugin will handle it
}
