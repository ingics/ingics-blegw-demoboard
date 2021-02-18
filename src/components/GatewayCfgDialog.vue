<template>
    <q-dialog
        v-model="dialogValue"
    >
        <!-- <q-card :style="{minWidth: $q.platform.is.mobile ? '100%' : '50vw'}"> -->
        <q-card :style="{minWidth: '50vw'}">
            <q-card-section class="gateway-setting-header q-pa-none">
                <q-toolbar>
                    <q-toolbar-title>{{ title }}</q-toolbar-title>
                    <q-space />
                    <q-btn
                        round flat size=".7rem"
                        v-model="showMore"
                        @click="showMore = !showMore"
                        :icon="showMore ? 'expand_less' : 'expand_more'" />
                </q-toolbar>
            </q-card-section>
            <q-separator />
            <q-card-section>
                <div>
                    <q-select outlined label="Protocol" v-model="newApp" :options="apps" emit-value map-options />
                    <q-input outlined label="Name" v-model="newName" class="q-mb-xs" />
                    <q-input outlined label="Host" v-model="newHost" class="q-mb-xs" />
                    <q-input outlined label="Port" type="number" v-model.number="newPort" hide-bottom-space class="q-mb-xs" />
                    <q-input v-if="newApp == 'mqtt'" outlined label="Subscribe Topic" v-model="newTopic" class="q-mb-xs" />
                    <q-input v-if="showMore" outlined label="Beacon Clear Timeout" type="number" v-model.number="newClearTimeout" hide-bottom-space class="q-mb-xs" />
                </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right" class="gateway-setting-header">
                <q-btn flat dense v-close-popup>Cancel</q-btn>
                <q-btn flat dense v-close-popup @click="saveSettings">Save</q-btn>
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
export default {
    // name: 'GatewayCfgDialog',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        cfg: {
            type: Object,
            default: () => {
                return {
                    app: 'mqtt',
                    name: '',
                    host: '',
                    port: 1883,
                    topic: '',
                    clearTimeout: 5
                }
            }
        }
    },
    data () {
        return {
            title: 'Gateway Configuration',
            newApp: '',
            newName: '',
            newHost: '',
            newPort: 1883,
            newTopic: '',
            newClearTimeout: 5,
            dialogValue: false,
            apps: [
                {
                    label: 'MQTT',
                    value: 'mqtt'
                }, {
                    label: 'M2M',
                    value: 'm2m'
                }
            ],
            showMore: false
        }
    },
    mounted () {
        this.dialogValue = this.value
        this.title = this.cfg.name ? 'Gateway Configuration' : 'Add Gateway'
        this.newApp = this.cfg.app
        this.newName = this.cfg.name
        this.newHost = this.cfg.host
        this.newPort = this.cfg.port
        this.newTopic = this.cfg.topic
        this.newClearTimeout = this.cfg.clearTimeout ? this.cfg.clearTimeout : 5
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
        saveSettings () {
            this.$emit('save', {
                app: this.newApp,
                name: this.newName.trim(),
                host: this.newHost.trim(),
                port: this.newPort,
                topic: this.newTopic.trim(),
                clearTimeout: this.newClearTimeout
            })
        }
    }
}
</script>
