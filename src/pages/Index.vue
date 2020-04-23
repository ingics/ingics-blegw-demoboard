<template>
    <q-page>
        <q-header elevated>
            <q-toolbar>
                <q-btn
                    v-if="activeClient"
                    flat
                    dense
                    round
                    icon="keyboard_arrow_left"
                    @click="deactivateGateway"
                />
                <q-toolbar-title v-if="!activeClient">Dashboard</q-toolbar-title>
                <q-toolbar-title v-if="activeClient">{{ currentCfg.name }}</q-toolbar-title>
                <q-circular-progress
                    v-if="activeClient && !activeClientStatus"
                    indeterminate
                    dense
                    size="20px"
                    color="lime"
                    class="q-mr-sm"
                />
                <q-btn
                    v-if="activeClient"
                    flat
                    dense
                    round
                    icon="receipt"
                ><q-tooltip>Logs</q-tooltip></q-btn>
                <q-btn
                    v-if="activeClient"
                    flat
                    dense
                    round
                    icon="style"
                ><q-tooltip>Beacons</q-tooltip></q-btn>
            </q-toolbar>
        </q-header>

        <div v-if="!activeClient" class="absolute scroll" style="top:0; left: 0; right: 0; bottom: 0;">
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
                        @selected="activateGateway"
                        @setting="launchGatewayCfg"
                    ></gateway-card>
                </div>
            </div>
            <div v-else class="text-center q-mt-lg text-grey-6 text-weight-bold" style="font-size: 2.5rem;">
                <div>No Gateway</div>
            </div>
        </div>
        <gateway-cfg-dialog
            :cfg="currentCfg"
            :key="currentCfgKey"
            @save="saveGatewaySetting"
            v-model="currentCfgDialog" />
        <q-page-sticky v-if="!activeClient" position="bottom-right" :offset="[18, 18]">
            <q-btn fab icon="add" color="accent" @click="launchGatewayCfg(null)" />
        </q-page-sticky>
        <log-browser v-if="activeClient" :logs="logs" />
    </q-page>
</template>

<script>
import mqtt from 'mqtt'
import moment from 'moment'
import GatewayCard from '../components/GatewayCard'
import GatewayCfgDialog from '../components/GatewayCfgDialog'
import LogBrowser from '../components/LogBrowser'
export default {
    name: 'PageIndex',
    components: {
        GatewayCard,
        GatewayCfgDialog,
        LogBrowser
    },
    data () {
        return {
            gateways: [
                {
                    name: 'IGS03M_3B_04',
                    host: 'ingics.ddns.net',
                    port: 2883,
                    topic: 'testroom/IGS03M_3B_04'
                }
            ],
            currentCfg: undefined,
            currentCfgKey: '',
            currentCfgDialog: false,
            clients: {},
            activeClient: undefined,
            logs: [],
            beacons: []
        }
    },
    methods: {
        launchGatewayCfg (name) {
            this.currentCfg = this.gateways.find(v => v.name === name)
            this.currentCfgKey = name || 'new-gw-' + Math.random()
            this.currentCfgDialog = true
        },
        saveGatewaySetting (cfg) {
            if (this.currentCfgKey.startsWith('new-gw-')) {
                this.gateways.push({
                    name: cfg.name,
                    host: cfg.host,
                    port: cfg.port,
                    topic: cfg.topic
                })
            } else {
                this.$set(this.currentCfg, 'name', cfg.name)
                this.$set(this.currentCfg, 'host', cfg.host)
                this.$set(this.currentCfg, 'port', cfg.port)
                this.$set(this.currentCfg, 'topic', cfg.topic)
            }
        },
        activateGateway (name) {
            const me = this
            this.currentCfg = this.gateways.find(v => v.name === name)
            this.activeClientStatus = false
            this.activeClient = mqtt.connect({
                host: this.currentCfg.host,
                port: this.currentCfg.port
            })
            this.activeClient.on('connect', function () {
                me.activeClientStatus = true
                me.activeClient.subscribe(me.currentCfg.topic)
            })
            this.activeClient.on('message', function (topic, payload) {
                if (me.logs.length === 100) { me.logs.splice(0, 1) }
                me.logs.push({ timestamp: moment(), message: payload.toString() })
            })
            this.activeClient.on('close', function () {
                me.activeClientStatus = false
            })
        },
        deactivateGateway () {
            this.activeClient.end(() => {
                this.currentCfg = undefined
                this.activeClient = undefined
                this.logs.splice(0, this.logs.length)
            })
        }
    }
}
</script>
