import { parseMessage } from '@ingics/message-parser'

function messageHandler (state, payload) {
    const me = this
    parseMessage(payload, data => {
        if (!['GPRP', 'LRAD', '1MAD'].includes(data.type)) { return }
        if (data.rssi >= me.store.state.db.rssiThreshold) {
            me.currentMessageCount += 1
            me.store.commit('db/insertOrUpdateBeacon', data)
            me.store.commit('db/insertMessage', { ts: data.timestamp, raw: data.fullMessage })
        }
    })
}

export default function () {
    const me = this
    return store => {
        me.store = store
        me.currentMessageCount = 0

        store.subscribe(({ type, payload }, state) => {
            if (type === 'connection/message') {
                messageHandler.bind(me)(state, payload)
            } else if (type === 'connection/connected') {
                me.enabled = true
                if (!me.messageCountTimer) {
                    me.messageCountTimer = setInterval(() => {
                        const start = Date.now()
                        me.store.commit('db/updateMessageCounter', me.currentMessageCount)
                        me.currentMessageCount = 0
                        me.store.commit('db/beaconTTL')
                        // me.store.commit('db/messageTTL')
                        const end = Date.now()
                        if ((end - start) > 1000) {
                            console.log('[messageCountTimer]', 'Warning:', 'take more than 1s to handle')
                        }
                        // const used = process.memoryUsage()
                        // for (const key in used) {
                        //     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
                        // }
                    }, 1000)
                }
            } else if (type === 'connection/disconnected') {
                if (me.messageCountTimer) {
                    clearInterval(me.messageCountTimer)
                    me.messageCountTimer = null
                }
            } else if (type === 'connection/ended') {
                me.store.commit('db/clearMessageCounter')
                me.store.commit('db/clearBeacons')
                me.store.commit('db/clearMessages')
            }
        })
    }
}
