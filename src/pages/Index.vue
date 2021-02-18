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
                <q-btn
                    flat dense round
                    icon="info"
                    @click="aboutDialog = true"
                ></q-btn>
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
                        :name="gateway.name"
                        :host="gateway.host"
                        :port="gateway.port"
                        :protocol="gateway.protocol"
                        :topic="gateway.topic"
                        :app="gateway.app"
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
        <beacon-browser v-if="activeClient && browseMode=='beacon'" :beacons="beacons" @beacon-refresh="refreshBeacons" />
        <q-dialog v-model="aboutDialog">
            <q-card :style="{minWidth: '30vw'}">
                <q-card-section>
                    <q-item-section>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Version: {{ appVersion }}</q-item-label>
                        <q-item-label>Commit: {{ appHash }}</q-item-label>
                        <q-item-label>NodeJS: {{ nodejsVersion }}</q-item-label>
                        <q-item-label>Vue: {{ vueVersion }}</q-item-label>
                        <q-item-label>Quasar: {{ $q.version }}</q-item-label>
                        <q-item-label>Electron: {{ electronVersion }}</q-item-label>
                        <q-item-label>Parser: {{ parserVersion }}</q-item-label>
                    </q-item-section>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import Vue from 'vue'
import net from 'net'
import mqtt from 'mqtt'
import readline from 'readline'
import { parseMessage } from '@ingics/message-parser'
import AdvUtils from '../mixins/AdvUtils'
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
            currentCfg: null,
            currentCfgKey: '',
            currentCfgDialog: false,
            clients: {},
            activeClient: null,
            activeClientStatus: false,
            activeClientPause: false,
            logs: [],
            beacons: [],
            browseMode: 'log',
            aboutDialog: false,
            beaconClearTimeout: null
        }
    },
    mixins: [
        AdvUtils
    ],
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
            this.$set(gateway, 'clearTimeout', cfg.clearTimeout)
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
                    const oldCfg = this.currentCfg
                    me.deactivateGateway()
                    me.applyGatewaySetting(oldCfg, cfg, true)
                    // me.activateGateway(cfg.name)
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
                try {
                    me.updateLogs(payload.toString())
                } catch (e) { console.log(e) }
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
                // console.log('on connected')
                me.activeClientStatus = true
                const rl = readline.createInterface({ input: me.activeClient })
                rl.on('line', line => {
                    if (me.activeClientPause) { return }
                    try {
                        me.updateLogs(line.trim())
                    } catch (e) { console.log(e) }
                })
            })
            this.activeClient.on('end', function () {
                // console.log('on end')
            })
            this.activeClient.on('close', function () {
                // console.log('on closed')
                me.activeClientStatus = false
            })
            this.activeClient.on('timeout', function (data) {
                // not sure what should i do
                // console.log('on timeout')
                me.activeClient.close()
                me.activeClient.connect(this.currentCfg.port, this.currentCfg.host)
            })
            this.activeClient.on('error', function (error) {
                // console.log('on error')
                me.$q.notify({ message: error.toString(), color: 'red' })
            })
            // console.log('connect')
            this.activeClient.connect(this.currentCfg.port, this.currentCfg.host)
        },
        activateGateway (name) {
            const me = this
            this.currentCfg = this.gateways.find(v => v.name === name)
            this.activeClientPause = false
            this.activeClientStatus = false
            if (this.currentCfg.app === 'mqtt') {
                this.activateMqttGateway()
            } else if (this.currentCfg.app === 'm2m') {
                this.activateM2mGateway()
            }
            this.beaconClearTimeout = setInterval(() => {
                const now = Date.now() // millinseconds
                const clearTimeout = me.currentCfg.clearTimeout ? me.currentCfg.clearTimeout * 1000 : 5000
                while (true) {
                    const index = me.beacons.findIndex((e) => (now - e.timestamp) > (clearTimeout))
                    if (index >= 0) {
                        me.beacons.splice(index, 1)
                    } else {
                        break
                    }
                }
            }, 1000)
        },
        deactivateGateway () {
            if (this.beaconClearTimeout) {
                clearTimeout(this.beaconClearTimeout)
                this.beaconClearTimeout = null
            }
            // this.activeClient.destroy()
            this.activeClient.end(() => {
                this.currentCfg = null
                this.activeClient = null
                this.logs.splice(0, this.logs.length)
                this.beacons.splice(0, this.beacons.length)
            })
        },
        updateLogs (payload) {
            const me = this
            parseMessage(payload, data => {
                // update log list
                if (me.logs.length === 100) { me.logs.pop() }
                me.logs.splice(0, 0, { timestamp: data.timestamp, message: payload })
                // update beacon only by broadcast data
                if (!['GPRP', 'LRAD', '1MAD'].includes(data.type)) { return }
                const old = this.beacons.find(v => v.mac === data.beacon)
                // pre-processing
                const ad = this.advPreprocessing(data.advertisement)
                const msd = ad.msd
                let accel
                if (msd && 'accel' in msd) accel = msd.accel
                else if (msd && 'accels' in msd) accel = msd.accels[0]
                if (old) {
                    this.$set(old, 'rssi', data.rssi)
                    this.$set(old, 'timestamp', data.timestamp)
                    this.$set(old, 'ad', ad)
                    old.rssis.push({ ts: data.timestamp, rssi: data.rssi })
                    if (old.rssis.length > 300) old.rssis.splice(0, old.rssis.length - 300)
                    old.accels.push({ ts: data.timestamp, accel: accel })
                    if (old.accels.length > 300) old.accels.splice(0, old.accels.length - 300)
                } else {
                    this.beacons.push({
                        mac: data.beacon,
                        rssi: data.rssi,
                        timestamp: data.timestamp,
                        ad: ad,
                        rssis: [{ ts: data.timestamp, rssi: data.rssi }],
                        accels: [{ ts: data.timestamp, accel: accel }]
                    })
                }
            })
        },
        refreshBeacons () {
            this.beacons.splice(0, this.beacons.length)
        }
    },
    computed: {
        appHash: () => process.env.APP_HASH,
        appVersion: () => process.env.APP_VERSION,
        electronVersion: () => process.env.ELECTRON_VERSION,
        vueVersion: () => Vue.version,
        nodejsVersion: () => process.version,
        parserVersion: () => process.env.PARSER_VERSION
    }
}
</script>
