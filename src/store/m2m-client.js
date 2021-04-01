import net from 'net'
import readline from 'readline'
import { APPMODE_M2M_CLIENT } from './cfg/constants'

function doConnect (state) {
    const me = this
    if (state.cfg.appmode === APPMODE_M2M_CLIENT) {
        this.connection = new net.Socket()
        this.connection.on('connect', function () {
            console.log('m2m-client', 'on connect')
            me.store.commit('connection/connected')
            const rl = readline.createInterface({ input: me.connection })
            rl.on('line', line => {
                // console.log('m2m-client', 'line', line.trim())
                if (!me.store.state.connection.pause) {
                    me.store.commit('connection/message', line.trim())
                }
            })
        })
        this.connection.on('end', function () {
            console.log('m2m-client', 'on end')
        })
        this.connection.on('close', function () {
            console.log('m2m-client', 'on close')
            me.store.commit('connection/disconnected')
        })
        this.connection.on('timeout', function (data) {
            // not sure what should I do here
            // seems I need to handle reconnect by my-self
            console.log('m2m-client', 'on timeout')
            me.connection.close()
            me.connection.connect(state.cfg.port, state.cfg.host)
        })
        this.connection.on('error', function (error) {
            // not sure what should I do here
            // seems I need to handle reconnect by my-self
            console.log('m2m-client', 'on error', error.toString())
            me.store.commit('connection/error', error)
            me.connection.close()
            me.connection.connect(state.cfg.port, state.cfg.host)
        })
        console.log('m2m-client', 'connect')
        this.connection.connect(state.cfg.port, state.cfg.host)
    }
}

function doDisconnect (state) {
    if (this.connection) {
        console.log('m2m-client', 'close connection')
        this.connection.end()
        this.connection = null
    }
}

function cfgSaveHandler (state) {
    console.log('m2m-client', 'cfgSaveHandler', state)
    doDisconnect.bind(this)(state)
    doConnect.bind(this)(state)
}

function conConnectHandler (state) {
    console.log('m2m-client', 'conConnectHandler')
    if (this.connection) {
        console.log('m2m-client', 'already connected, skip')
        return
    }
    doConnect.bind(this)(state)
}

function conDisconnectHandler (state) {
    console.log('m2m-client', 'conDisconnectHandler')
    doDisconnect.bind(this)(state)
}

export default function () {
    const me = this
    me.connection = null
    return store => {
        me.store = store
        store.subscribe(({ type, payload }, state) => {
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
