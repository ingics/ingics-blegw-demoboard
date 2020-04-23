<template>
    <q-page>
        <q-header elevated>
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                />
                <q-toolbar-title>Dashboard</q-toolbar-title>
                <div>Quasar v{{ $q.version }}</div>
            </q-toolbar>
        </q-header>

        <div class="absolute scroll" style="top:0; left: 0; right: 0; bottom: 0;">
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
                        @selected="test"
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
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-btn fab icon="add" color="accent" @click="launchGatewayCfg(null)" />
        </q-page-sticky>
    </q-page>
</template>

<script>
import GatewayCard from '../components/GatewayCard'
import GatewayCfgDialog from '../components/GatewayCfgDialog'
export default {
    name: 'PageIndex',
    components: {
        GatewayCard,
        GatewayCfgDialog
    },
    data () {
        return {
            gateways: [
                // {
                //     name: 'IGS03M_3B_04',
                //     host: 'ingics.ddns.com',
                //     port: 2883,
                //     topic: 'testroom/IGS03M_3B_04'
                // }
            ],
            currentCfg: undefined,
            currentCfgKey: '',
            currentCfgDialog: false
        }
    },
    methods: {
        test (message) {
            console.log(message)
        },
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
        }
    }
}
</script>
