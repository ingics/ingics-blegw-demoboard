import { APPMODE_M2M_CLIENT, APPMODE_M2M_SERVER, APPMODE_MQTT_BROKER, APPMODE_MQTT_CLIENT } from './constants'

export function name (state) {
    if (state.appmode === APPMODE_MQTT_CLIENT) {
        return `MQTT ${state.host}:${state.port} [${state.topic}]`
    } else if (state.appmode === APPMODE_M2M_CLIENT) {
        return `M2M ${state.host}:${state.port}`
    } else if (state.appmode === APPMODE_MQTT_BROKER) {
        return 'MQTT BROKER'
    } else if (state.appmode === APPMODE_M2M_SERVER) {
        return 'M2M SERVER'
    }
}
