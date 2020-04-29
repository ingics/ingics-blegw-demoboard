<template>
    <q-page>
        <q-header elevated>
            <q-toolbar>
                <q-btn
                    v-if="activeClient"
                    flat dense round
                    icon="keyboard_arrow_left"
                    @click="deactivateGateway"
                />
                <q-toolbar-title v-if="!activeClient">
                    Gateway List
                </q-toolbar-title>
                <q-toolbar-title v-if="activeClient">
                    {{ currentCfg.name }}
                    </q-toolbar-title>
                <q-btn
                    v-if="activeClient && activeClientPause"
                    flat dense round
                    icon="play_arrow"
                    :loading="!activeClientStatus"
                    @click="activeClientPause=false"
                ><q-tooltip>Play</q-tooltip></q-btn>
                <q-btn
                    v-if="activeClient && !activeClientPause"
                    flat dense round
                    icon="pause"
                    :loading="!activeClientStatus"
                    @click="activeClientPause=true"
                ><q-tooltip>Pause</q-tooltip></q-btn>
                <q-btn
                    v-if="activeClient && browseMode=='beacon'"
                    flat dense round
                    icon="receipt"
                    @click="browseMode='log'"
                ><q-tooltip>Logs</q-tooltip></q-btn>
                <q-btn
                    v-if="activeClient && browseMode=='log'"
                    flat dense round
                    icon="style"
                    @click="browseMode='beacon'"
                ><q-tooltip>Beacons</q-tooltip></q-btn>
                <q-btn
                    v-if="activeClient"
                    flat dense round
                    icon="settings"
                    @click="launchGatewayCfg(currentCfg.name)"
                ><q-tooltip>Configuration</q-tooltip></q-btn>
            </q-toolbar>
        </q-header>

        <div
            v-if="!activeClient"
            class="absolute scroll"
            style="top:0; left: 0; right: 0; bottom: 0;"
        >
            <div v-if="gateways.length" class="mqtt-clients row">
                <div
                    class="q-pt-md q-px-md col-xl-3 col-md-4 col-sm-6 col-xs-12"
                    v-for="gateway in gateways"
                    :key="gateway.name"
                >
                    <gateway-card
                        :name=gateway.name
                        :host=gateway.host
                        :port=gateway.port
                        :protocol=gateway.protocol
                        :topic=gateway.topic
                        :app=gateway.app
                        @selected="activateGateway"
                        @setting="launchGatewayCfg"
                        @delete="deleteGateway"
                    ></gateway-card>
                </div>
            </div>
            <div
                v-else
                class="text-center q-mt-lg text-grey-6 text-weight-bold"
                style="font-size: 2.5rem;"
            >No Gateway</div>
        </div>
        <gateway-cfg-dialog
            :cfg="currentCfg"
            :key="currentCfgKey"
            @save="saveGatewaySetting"
            v-model="currentCfgDialog" />
        <q-page-sticky v-if="!activeClient" position="bottom-right" :offset="[18, 18]">
            <q-btn fab icon="add" color="accent" @click="launchGatewayCfg(null)" />
        </q-page-sticky>
        <log-browser v-if="activeClient && browseMode=='log'" :logs="logs" />
        <beacon-browser v-if="activeClient && browseMode=='beacon'" :beacons="beacons" />
    </q-page>
</template>

<script>
import net from 'net'
import mqtt from 'mqtt'
import moment from 'moment'
import { parseMessage } from '@ingics/message-parser'
import GatewayCard from '../components/GatewayCard'
import GatewayCfgDialog from '../components/GatewayCfgDialog'
import LogBrowser from '../components/LogBrowser'
import BeaconBrowser from '../components/BeaconBrowser'
export default {
    name: 'PageIndex',
    components: {
        GatewayCard,
        GatewayCfgDialog,
        LogBrowser,
        BeaconBrowser
    },
    data () {
        return {
            gateways: [],
            currentCfg: undefined,
            currentCfgKey: '',
            currentCfgDialog: false,
            clients: {},
            activeClient: undefined,
            activeClientStatus: false,
            activeClientPause: false,
            logs: [],
            beacons: [],
            browseMode: 'log'
        }
    },
    mounted () {
        const storedGateways = this.$q.localStorage.getItem('gateways')
        if (storedGateways) { this.gateways = storedGateways }
    },
    methods: {
        launchGatewayCfg (name) {
            this.currentCfg = this.gateways.find(v => v.name === name)
            this.currentCfgKey = name || 'new-gw-' + Math.random()
            this.currentCfgDialog = true
        },
        applyGatewaySetting (gateway, cfg, flush = false) {
            this.$set(gateway, 'app', cfg.app)
            this.$set(gateway, 'name', cfg.name)
            this.$set(gateway, 'host', cfg.host)
            this.$set(gateway, 'port', cfg.port)
            this.$set(gateway, 'topic', cfg.topic)
            if (flush) { this.$q.localStorage.set('gateways', this.gateways) }
        },
        saveGatewaySetting (cfg) {
            const me = this
            if (this.currentCfgKey.startsWith('new-gw-')) {
                const gw = {}
                this.applyGatewaySetting(gw, cfg)
                this.gateways.push(gw)
                this.$q.localStorage.set('gateways', this.gateways)
            } else {
                if (this.activeClient) {
                    this.activeClient.end(() => {
                        me.logs.splice(0, this.logs.length)
                        me.beacons.splice(0, this.beacons.length)
                        me.applyGatewaySetting(this.currentCfg, cfg, true)
                        me.activateGateway(cfg.name)
                    })
                } else {
                    this.applyGatewaySetting(this.currentCfg, cfg, true)
                }
            }
        },
        deleteGateway (name) {
            const idx = this.gateways.findIndex(v => v.name === name)
            if (idx >= 0) {
                this.gateways.splice(idx, 1)
                this.$q.localStorage.set('gateways', this.gateways)
            }
        },
        activateMqttGateway (name) {
            const me = this
            this.activeClient = mqtt.connect({
                host: this.currentCfg.host,
                port: this.currentCfg.port
            })
            this.activeClient.on('connect', function () {
                me.activeClientStatus = true
                me.activeClient.subscribe(me.currentCfg.topic)
            })
            this.activeClient.on('message', function (topic, payload) {
                if (me.activeClientPause) { return }
                me.updateBeacons(payload.toString())
                if (me.logs.length === 100) { me.logs.pop() }
                me.logs.splice(0, 0, { timestamp: moment(), message: payload.toString() })
            })
            this.activeClient.on('close', function () {
                me.activeClientPause = false
                me.activeClientStatus = false
            })
            this.activeClient.on('error', function (error) {
                me.$q.notify({ message: error.toString(), color: 'red' })
            })
        },
        activateM2mGateway () {
            const me = this
            this.activeClient = new net.Socket()
            this.activeClient.on('connect', function () {
                me.activeClientStatus = true
            })
            this.activeClient.on('close', function () {
                me.activeClientStatus = false
            })
            this.activeClient.on('data', function (data) {
                if (me.activeClientPause) { return }
                const lines = data.toString().trim().split('\n')
                lines.forEach(line => {
                    me.updateBeacons(line)
                    if (me.logs.length === 100) { me.logs.pop() }
                    me.logs.splice(0, 0, { timestamp: moment(), message: line.trim() })
                })
            })
            this.activeClient.on('timeout', function (data) {
                // not sure what should i do
                me.activeClient.close()
                me.activeClient.connect(this.currentCfg.port, this.currentCfg.host)
            })
            this.activeClient.on('error', function (error) {
                me.$q.notify({ message: error.toString(), color: 'red' })
            })
            this.activeClient.connect(this.currentCfg.port, this.currentCfg.host)
        },
        activateGateway (name) {
            this.currentCfg = this.gateways.find(v => v.name === name)
            this.activeClientPause = false
            this.activeClientStatus = false
            if (this.currentCfg.app === 'mqtt') {
                this.activateMqttGateway()
            } else if (this.currentCfg.app === 'm2m') {
                this.activateM2mGateway()
            }
        },
        deactivateGateway () {
            this.activeClient.end(() => {
                this.currentCfg = undefined
                this.activeClient = undefined
                this.logs.splice(0, this.logs.length)
                this.beacons.splice(0, this.beacons.length)
            })
        },
        collectIngicsBeaconAttributes (tokens, parsed) {
            function appendAttr (attr, cb) {
                if (attr in parsed) {
                    if (cb) {
                        tokens.push(cb(parsed[attr]))
                    } else {
                        tokens.push(`${attr}: ${parsed[attr]}`)
                    }
                }
            }
            function appendEvent (event, cb) {
                if (event in parsed.events) {
                    if (cb) {
                        tokens.push(cb(parsed.events[event]))
                    } else {
                        tokens.push(`${event}: ${parsed.events[event]}`)
                    }
                }
            }
            appendAttr('battery', e => `battery: ${e / 100}V`)
            appendAttr('temperature', e => `temperature: ${e / 100}°C`)
            appendAttr('humidity', e => `humidity: ${e}%`)
            appendAttr('temperature_ext', e => `ext temperature: ${e / 100}°C`)
            appendEvent('button')
            appendEvent('moving')
            appendEvent('hall')
            appendEvent('fall')
            appendEvent('detect')
            appendEvent('matt')
        },
        collectPayloadMessage (data) {
            const tokens = []
            if ('parsedPayload' in data) {
                const parsed = data.parsedPayload
                const { mfg, type } = parsed
                tokens.push(`${mfg} ${type || 'Unknown'}`)
                if (mfg === 'Ingics') {
                    this.collectIngicsBeaconAttributes(tokens, parsed)
                } else if (mfg === 'Apple' && type === 'iBeacon') {
                    const { uuid, major, minor, tx } = parsed
                    tokens.push(`uuid: ${uuid.toLocaleUpperCase()}`)
                    tokens.push(`major: ${major}`)
                    tokens.push(`minor: ${minor}`)
                    tokens.push(`tx power: ${tx}`)
                }
            }
            return tokens.join(', ')
        },
        updateBeacons (payload) {
            if (!payload.startsWith('$GPRP') && !payload.startsWith('$LRAD')) {
                // take care beacon update for GPRP data only
                // and only show beacon detail for ingics beacon & iBeacon
                return
            }
            try {
                parseMessage(payload, data => {
                    const beacon = {
                        mac: data.beacon,
                        rssi: data.rssi,
                        payload: data.payload,
                        message: this.collectPayloadMessage(data),
                        timestamp: moment()
                    }
                    // const idx = this.beacons.findIndex(v => v.mac === beacon.mac)
                    // if (idx >= 0) { this.beacons.splice(idx, 1) }
                    // this.beacons.splice(0, 0, beacon)
                    const old = this.beacons.find(v => v.mac === beacon.mac)
                    if (old) {
                        this.$set(old, 'rssi', beacon.rssi)
                        this.$set(old, 'payload', beacon.payload)
                        this.$set(old, 'message', beacon.message)
                        this.$set(old, 'timestamp', beacon.timestamp)
                    } else {
                        this.beacons.push(beacon)
                    }
                })
            } catch {}
        }
    }
}
</script>
