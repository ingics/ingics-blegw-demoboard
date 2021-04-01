import mqtt from 'mqtt'
import { APPMODE_MQTT_CLIENT } from './cfg/constants'

function doConnect (state) {
    const me = this
    if (state.cfg.appmode === APPMODE_MQTT_CLIENT) {
        this.connection = mqtt.connect({
            host: state.cfg.host,
            port: state.cfg.port
        })
        this.connection.on('connect', function (connack) {
            console.log('mqtt-client', 'on connect', connack)
            me.connection.subscribe(state.cfg.topic)
            me.store.commit('connection/connected')
        })
        this.connection.on('message', function (topic, payload) {
            // console.log('mqtt-client', 'on message', payload.toString())
            if (!me.store.state.connection.pause) {
                me.store.commit('connection/message', payload.toString())
            }
        })
        this.connection.on('close', function () {
            console.log('mqtt-client', 'on close')
            me.store.commit('connection/disconnected')
        })
        this.connection.on('end', function () {
            console.log('mqtt-client', 'on end')
            me.store.commit('connection/ended')
        })
        this.connection.on('error', function (error) {
            console.log('mqtt-client', 'on error', error.toString())
            me.store.commit('connection/error', error)
        })
    }
}

function doDisconnect (state) {
    if (this.connection) {
        console.log('mqtt-client', 'close connection')
        this.connection.end()
        this.connection = null
    }
}

function cfgSaveHandler (state) {
    console.log('mqtt-client', 'cfgSaveHandler', state)
    doDisconnect.bind(this)(state)
    doConnect.bind(this)(state)
}

function conConnectHandler (state) {
    console.log('mqtt-client', 'conConnectHandler')
    if (this.connection) {
        console.log('mqtt-client', 'already connected, skip')
        return
    }
    doConnect.bind(this)(state)
}

function conDisconnectHandler (state) {
    console.log('mqtt-client', 'conDisconnectHandler')
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
