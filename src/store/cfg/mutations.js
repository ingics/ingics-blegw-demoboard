/*
export function someMutation (state) {
}
*/

export function save (state, cfg) {
    state.appmode = cfg.appmode
    state.host = cfg.host
    state.port = cfg.port
    state.topic = cfg.topic
}
