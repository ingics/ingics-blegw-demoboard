import isNil from 'lodash/isNil'
export default {
    methods: {
        appendIngicsAttr (tokens, parsedData, attr, cb) {
            if (attr in parsedData) {
                if (cb) {
                    tokens.push(cb(parsedData[attr]))
                } else {
                    tokens.push(`${attr}: ${parsedData[attr]}`)
                }
            }
        },
        appendIngicsEvent (tokens, parsedData, event, cb) {
            if (event in parsedData.events) {
                if (cb) {
                    tokens.push(cb(parsedData.events[event]))
                } else {
                    tokens.push(`${event}: ${parsedData.events[event]}`)
                }
            }
        },
        collectIngicsBeaconAttributes (tokens, parsedData) {
            this.appendIngicsAttr(tokens, parsedData, 'battery', e => `battery: ${e / 100}V`)
            this.appendIngicsAttr(tokens, parsedData, 'temperature', e => `temperature: ${e / 100}°C`)
            this.appendIngicsAttr(tokens, parsedData, 'humidity', e => `humidity: ${e}%`)
            this.appendIngicsAttr(tokens, parsedData, 'temperature_ext', e => `ext temperature: ${e / 100}°C`)
            this.appendIngicsEvent(tokens, parsedData, 'button')
            this.appendIngicsEvent(tokens, parsedData, 'moving')
            this.appendIngicsEvent(tokens, parsedData, 'hall')
            this.appendIngicsEvent(tokens, parsedData, 'fall')
            this.appendIngicsEvent(tokens, parsedData, 'detect')
            this.appendIngicsEvent(tokens, parsedData, 'matt')
        },
        payloadDescription (parsedData) {
            const tokens = []
            if (!isNil(parsedData)) {
                const { mfg, type } = parsedData
                if (mfg === 'Ingics') {
                    tokens.push(`${mfg} ${type || 'Unknown'}`)
                    this.collectIngicsBeaconAttributes(tokens, parsedData)
                } else if (mfg === 'Apple' && type === 'iBeacon') {
                    tokens.push(`${mfg} ${type}`)
                    const { uuid, major, minor, tx } = parsedData
                    tokens.push(`uuid: ${uuid.toLocaleUpperCase()}`)
                    tokens.push(`major: ${major}`)
                    tokens.push(`minor: ${minor}`)
                    tokens.push(`tx power: ${tx}`)
                }
            }
            return tokens.join(', ')
        }
    }
}
