import isNil from 'lodash/isNil'
export default {
    methods: {
        appendIngicsAttr (tokens, msd, attr, cb) {
            if (attr in msd) {
                if (cb) {
                    tokens.push(cb(msd[attr]))
                } else {
                    tokens.push(`${attr}: ${msd[attr]}`)
                }
            }
        },
        appendIngicsEvent (tokens, msd, event, cb) {
            if (event in msd.events) {
                if (cb) {
                    tokens.push(cb(msd.events[event]))
                } else {
                    tokens.push(`${event}: ${msd.events[event]}`)
                }
            }
        },
        collectIngicsBeaconAttributes (tokens, msd) {
            this.appendIngicsAttr(tokens, msd, 'battery', e => `battery: ${e}V`)
            this.appendIngicsAttr(tokens, msd, 'temperature', e => `temperature: ${e}°C`)
            this.appendIngicsAttr(tokens, msd, 'humidity', e => `humidity: ${e}%`)
            this.appendIngicsAttr(tokens, msd, 'temperatureExt', e => `ext temperature: ${e}°C`)
            this.appendIngicsEvent(tokens, msd, 'button')
            this.appendIngicsEvent(tokens, msd, 'moving')
            this.appendIngicsEvent(tokens, msd, 'hall')
            this.appendIngicsEvent(tokens, msd, 'fall')
            this.appendIngicsEvent(tokens, msd, 'detect')
            this.appendIngicsEvent(tokens, msd, 'matt')
        },
        payloadDescription (msd) {
            const tokens = []
            if (!isNil(msd)) {
                const { company, type } = msd
                if (msd.is('ingics')) {
                    tokens.push(`${company} ${type || 'Unknown'}`)
                    this.collectIngicsBeaconAttributes(tokens, msd)
                } else if (msd.is('ibeacon')) {
                    tokens.push(`${company} ${type}`)
                    const { uuid, major, minor, tx } = msd
                    tokens.push(`uuid: ${uuid}`)
                    tokens.push(`major: ${major}`)
                    tokens.push(`minor: ${minor}`)
                    tokens.push(`tx power: ${tx}`)
                }
            }
            return tokens.join(', ')
        }
    }
}
