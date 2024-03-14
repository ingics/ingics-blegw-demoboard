import { APPMODE_M2M_CLIENT } from './cfg/constants'

function conConnectHandler (state) {
    console.log('m2m-client', 'conConnectHandler')
    if (this.connection) {
        console.log('m2m-client', 'already connected, skip')
        return
    }
    if (state.cfg.appmode === APPMODE_M2M_CLIENT) {
        window.m2m.connect(state.cfg.host, state.cfg.port)
    }
}

function conDisconnectHandler (state) {
    console.log('m2m-client', 'conDisconnectHandler')
    window.m2m.disconnect()
}

function cfgSaveHandler (state) {
    console.log('m2m-client', 'cfgSaveHandler', state)
    window.m2m.disconnect()
    if (state.cfg.appmode === APPMODE_M2M_CLIENT) {
        window.m2m.connect(state.cfg.host, state.cfg.port)
    }
}

function onConnect () {
    console.log('m2m-client', 'on connect')
    this.store.commit('connection/connected')
}

function onClose () {
    console.log('m2m-client', 'on close')
    this.store.commit('connection/disconnected')
}

function onError (err) {
    console.log('m2m-client', 'on error')
    this.store.commit('connection/error', err)
}

function onLine (line) {
    const me = this
    if (!me.store.state.connection.pause) {
        console.log('m2m-client', 'on line', line)
        me.store.commit('connection/message', line.trim())
    }
}

export default function () {
    const me = this
    me.connection = null

    window.m2m.onConnect(onConnect.bind(me))
    window.m2m.onClose(onClose.bind(me))
    window.m2m.onError(onError.bind(me))
    window.m2m.onLine(onLine.bind(me))

    return store => {
        me.store = store
        store.subscribe(({ type, _payload }, state) => {
            if (type === 'cfg/save') {
                cfgSaveHandler.bind(me)(state)
            } else if (type === 'connection/connect') {
                conConnectHandler.bind(me)(state)
            } else if (type === 'connection/disconnect') {
                conDisconnectHandler.bind(me)(state)
            }
        })
    }
}
