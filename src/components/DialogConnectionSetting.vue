<template>
    <q-dialog v-model="dialogValue">
        <!-- <q-card :style="{minWidth: $q.platform.is.mobile ? '100%' : '50vw'}"> -->
        <q-card :style="{minWidth: '50vw'}">
            <q-card-section class="gateway-setting-header q-pa-none">
                <q-toolbar>
                    <q-toolbar-title>{{ title }}</q-toolbar-title>
                    <q-space />
                    <q-btn round flat size=".7rem" v-close-popup icon="close" />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section>
                <div>
                    <q-select outlined label="Protocol" v-model="newApp" :options="apps" emit-value map-options />
                    <q-input outlined label="Host" v-model="newHost" class="q-mb-xs" />
                    <q-input outlined label="Port" type="number" v-model.number="newPort" hide-bottom-space class="q-mb-xs" />
                    <q-input v-if="newApp == 'mqtt'" outlined label="Subscribe Topic" v-model="newTopic" class="q-mb-xs" />
                    <q-input v-if="showMore" outlined label="Beacon Clear Timeout" type="number" v-model.number="newClearTimeout" hide-bottom-space class="q-mb-xs" />
                </div>
            </q-card-section>
            <q-separator />
            <q-card-actions class="gateway-setting-header">
                <q-btn flat dense>
                    Load
                    <q-menu>
                        <q-list dense>
                            <q-item v-close-popup clickable v-for="gateway in gateways" :key="gateway.name" @click="loadGateway(gateway)">
                                <q-item-section>{{ gatewayDesc(gateway) }}</q-item-section>
                                <q-btn round flat icon="delete" color="green" @click="deleteGateway(gateway)"></q-btn>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
                <q-btn flat dense>
                    Save
                    <q-menu>
                        <q-card class="q-pa-sm">
                            <q-input label="name" v-model="name">
                                <template v-slot:after>
                                    <q-btn
                                        round dense flat v-close-popup
                                        icon="save"
                                        @click="saveGateway()" />
                                </template>
                            </q-input>
                        </q-card>
                    </q-menu>
                </q-btn>
                <q-space />
                <q-btn flat dense v-close-popup @click="applySettings">Connect</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<style lang="sass" scoped>
    .gateway-setting-header
        color: white
        background-color: $primary
</style>

<script>
import { APPMODE_M2M_CLIENT, APPMODE_MQTT_CLIENT } from 'src/store/cfg/constants'
export default {
    name: 'DialogConnectionSetting',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            title: 'Configurations',
            newApp: '',
            newHost: '',
            newPort: 1883,
            newTopic: '',
            newClearTimeout: 5,
            dialogValue: false,
            apps: [
                {
                    label: 'MQTT Client',
                    value: APPMODE_MQTT_CLIENT
                }, {
                    label: 'M2M (TCP) Client',
                    value: APPMODE_M2M_CLIENT
                }
            ],
            name: '',
            showMore: false,
            gateways: undefined
        }
    },
    mounted () {
        this.dialogValue = this.value
        this.title = 'Configurations'
        this.newApp = this.$store.state.cfg.appmode
        this.newHost = this.$store.state.cfg.host
        this.newPort = this.$store.state.cfg.port
        this.newTopic = this.$store.state.cfg.topic
        this.newClearTimeout = 5
        this.gateways = this.$q.localStorage.getItem('gateways')
    },
    watch: {
        value (v) {
            this.dialogValue = v
        },
        dialogValue (v) {
            this.$emit('input', v)
        }
    },
    methods: {
        applySettings () {
            this.$store.dispatch('cfg/save', {
                appmode: this.newApp,
                host: this.newHost.trim(),
                port: this.newPort,
                topic: this.newTopic.trim(),
                clearTimeout: this.newClearTimeout
            })
        },
        appMode (app) {
            if (app === 'm2m') return 'tcp-client'
            return app
        },
        gatewayDesc (gateway) {
            const {
                name,
                app,
                host,
                port,
                topic
            } = gateway
            if (app === APPMODE_MQTT_CLIENT) {
                return `${name} [${app}] ${host}:${port} "${topic}"`
            } else {
                return `${name} [${this.appMode(app)}] ${host}:${port}`
            }
        },
        loadGateway (gateway) {
            this.name = gateway.name
            this.newApp = gateway.app
            this.newHost = gateway.host
            this.newPort = gateway.port
            this.newTopic = gateway.topic
            if (this.newApp === 'm2m') this.newApp = APPMODE_M2M_CLIENT
        },
        deleteGateway (gateway) {
            const idx = this.gateways.findIndex(v => v.name === gateway.name)
            if (idx >= 0) {
                this.gateways.splice(idx, 1)
                this.$q.localStorage.set('gateways', this.gateways)
            }
        },
        saveGateway () {
            const gw = this.gateways.find(v => v.name === this.name)
            if (gw) {
                gw.app = this.newApp
                gw.host = this.newHost
                gw.port = this.newPort
                gw.topic = this.newTopic
            } else {
                this.gateways.push({
                    name: this.name,
                    app: this.newApp,
                    host: this.newHost,
                    port: this.newPort,
                    topic: this.newTopic
                })
            }
            this.$q.localStorage.set('gateways', this.gateways)
        }
    }
}
</script>
