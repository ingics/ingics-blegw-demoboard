export function insertMessage (state, { ts, raw }) {
    state.totalMessages += 1
    if (state.messages.length === state.maxMessages) {
        state.messages.pop()
    }
    state.messages.splice(0, 0, { ts, raw })
}

export function clearMessages (state) {
    state.messages.splice(0, state.messages.length)
}

export function messageTTL (state) {
    // cause we already limited the # of messages to 100,
    // the message TTL implementation is not necessary anymore
    const now = Date.now()
    const id = state.messages.findIndex(e => (now - e.ts) > state.messageTTL * 1000)
    if (id >= 0) {
        state.messages.splice(id, state.messages.length - id)
    }
}

export function updateMessageCounter (state, count) {
    state.messageCountChartData.rows.push({
        c: [
            { v: new Date() },
            { v: count }
        ]
    })
    state.messageCounter += count
    if (state.messageCountChartData.rows.length > 60) {
        state.messageCounter -= state.messageCountChartData.rows[0].c[1].v
        state.messageCountChartData.rows.splice(0, 1)
    }
}

export function clearMessageCounter (state) {
    state.totalMessages = 0
    state.messageCounter = 0
    state.messageCountChartData.rows.splice(0, state.messageCountChartData.rows.length)
}

/**
 * @param {object} data Object return by ingics message parser
 */
export function insertOrUpdateBeacon (state, data) {
    const msd = data.advertisement.manufacturerData
    let accel
    if (msd && Object.keys(msd).includes('accel')) accel = msd.accel
    if (msd && Object.keys(msd).includes('accels')) accel = msd.accels[0]
    const beacon = state.beacons.find(v => v.mac === data.beacon)
    if (beacon) {
        beacon.rssi = data.rssi
        beacon.timestamp = data.timestamp
        beacon.advertisement = data.advertisement
        beacon.rssis.push({ ts: data.timestamp, rssi: data.rssi })
        if (beacon.rssis.length > 180) {
            beacon.rssis.splice(0, beacon.rssis.length - 180)
        }
        beacon.accels.push({ ts: data.timestamp, accel: accel })
        if (beacon.accels.length > 180) {
            beacon.accels.splice(0, beacon.accels.length - 180)
        }
    } else {
        state.beacons.push({
            mac: data.beacon,
            rssi: data.rssi,
            timestamp: data.timestamp,
            advertisement: data.advertisement,
            rssis: [{ ts: data.timestamp, rssi: data.rssi }],
            accels: [{ ts: data.timestamp, accel: accel }]
        })
    }
}

export function clearBeacons (state) {
    state.beacons.splice(0, state.beacons.length)
}

export function setBeaconTTL (state, data) {
    // console.log(`mutation setBeaconTTL ${data}`)
    state.beaconTTL = data
}

export function beaconTTL (state) {
    const now = Date.now()
    while (true) {
        const id = state.beacons.findIndex(e => (now - e.timestamp) > state.beaconTTL * 1000)
        if (id >= 0) {
            state.beacons.splice(id, 1)
        } else {
            return
        }
    }
}

export function setRssiThreshold (state, data) {
    // console.log(`mutation setRssiThreshold ${data}`)
    state.rssiThreshold = data
}
