import { APPMODE_MQTT_CLIENT } from './cfg/constants'

function conConnectHandler (state) {
    console.log('mqtt-client', 'conConnectHandler')
    if (this.connection) {
        console.log('mqtt-client', 'already connected, skip')
        return
    }
    if (state.cfg.appmode === APPMODE_MQTT_CLIENT) {
        window.mqtt.connect(state.cfg.host, state.cfg.port, state.cfg.topic)
    }
}

function conDisconnectHandler (state) {
    console.log('mqtt-client', 'conDisconnectHandler')
    window.mqtt.disconnect()
}

function cfgSaveHandler (state) {
    console.log('mqtt-client', 'cfgSaveHandler', state)
    window.mqtt.disconnect()
    if (state.cfg.appmode === APPMODE_MQTT_CLIENT) {
        window.mqtt.connect(state.cfg.host, state.cfg.port, state.cfg.topic)
    }
}

function onConnect () {
    console.log('mqtt-client', 'on connect')
    this.store.commit('connection/connected')
}

function onEnd () {
    console.log('mqtt-client', 'on end')
    this.store.commit('connection/ended')
}

function onClose () {
    console.log('mqtt-client', 'on close')
    this.store.commit('connection/disconnected')
}

function onError () {
    console.log('mqtt-client', 'on error')
    this.store.commit('connection/error')
}

function onMessage (message) {
    // console.log('mqtt-client', 'on message', message)
    this.store.commit('connection/message', message)
}

export default function () {
    const me = this
    me.connection = null

    window.mqtt.onConnect(onConnect.bind(me))
    window.mqtt.onClose(onClose.bind(me))
    window.mqtt.onEnd(onEnd.bind(me))
    window.mqtt.onError(onError.bind(me))
    window.mqtt.onMessage(onMessage.bind(me))

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
