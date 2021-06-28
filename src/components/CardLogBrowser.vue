<template>
    <div>
        <q-table
            title="Received Messages"
            :data="$store.state.db.messages"
            :columns="columns"
            hide-header
            hide-bottom
            wrap-cells
            :grid="$q.screen.xs"
            :pagination.sync="pageOption"
            class="q-pa-md"
            @row-click="selectLog"
        >
            <template v-slot:top-right>
                <q-select
                    class="q-mx-sm"
                    style="min-width: 110px"
                    outlined borderless dense label="RSSI Filter" rounded
                    v-model="rssiFilter" :options="rssiThresholds" emit-value map-options
                >
                    <template v-slot:prepend><q-icon name="filter_list" /></template>
                </q-select>
                <q-btn
                    v-if="$store.state.connection.status === 'ok'"
                    outline rounded
                    :color="$store.state.connection.pause ? 'green-6' : 'orange-8'"
                    :label="$store.state.connection.pause ? 'resume' : 'pause'"
                    :icon-right="$store.state.connection.pause ? 'play_arrow' : 'pause'"
                    @click="$store.commit('connection/pause')"
                />
            </template>
        </q-table>
        <q-resize-observer @resize="onResize" />
        <q-dialog v-model="detailDialog" v-if="selectedLog">
            <q-card class="q-pa-md" :style="{minWidth: '80vw'}">
                <div v-if="!selectedLog.gnss">Beacon: {{ selectedLog.beacon }}</div>
                <div>Gateway: {{ selectedLog.gateway }}</div>
                <div v-if="!selectedLog.gnss">RSSI: {{ selectedLog.rssi }}</div>
                <div>Timestamp: {{ selectedLog.timestamp }}</div>
                <panel-advertisement v-if="selectedLog.advertisement" :ad="selectedLog.advertisement" />
                <div v-if="selectedLog.gnss">Fix Time: {{ selectedLog.gnss.fixTimestamp }}</div>
                <div v-if="selectedLog.gnss">Latitude: {{ selectedLog.gnss.latitude }}</div>
                <div v-if="selectedLog.gnss">Longitude: {{ selectedLog.gnss.longitude }}</div>
                <div v-if="selectedLog.gnss">Speed: {{ selectedLog.gnss.speed }}</div>
                <div v-if="selectedLog.gnss">HDOP: {{ selectedLog.gnss.hdop }}</div>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import moment from 'moment'
import AdvUtils from '../mixins/AdvUtils'
import { parseMessage } from '@ingics/message-parser'
import PanelAdvertisement from './PanelAdvertisement.vue'
export default {
    name: 'CardLogBrowser',
    components: {
        PanelAdvertisement
    },
    mixins: [
        AdvUtils
    ],
    data () {
        return {
            columns: [
                {
                    name: 'timestamp',
                    required: true,
                    label: 'Timestamp',
                    align: 'left',
                    field: row => row.ts,
                    format: val => `${moment(val).format('L LTS')}`,
                    sortable: false
                },
                {
                    name: 'message',
                    required: true,
                    label: 'Message',
                    align: 'left',
                    field: row => row.raw,
                    format: val => val.replace(/,/g, ',\n'), // for content wrap
                    sortable: false
                }
            ],
            pageOption: {
                rowsPerPage: 0
            },
            detailDialog: false,
            selectedLog: undefined,
            rssiThresholds: [
                { label: '-50 dBm', value: -50 },
                { label: '-60 dBm', value: -60 },
                { label: '-70 dBm', value: -70 },
                { label: '-80 dBm', value: -80 },
                { label: '-90 dBm', value: -90 },
                { label: '-100 dBm', value: -100 },
                { label: '-120 dBm', value: -120 }
            ]
        }
    },
    methods: {
        onResize (size) {
            this.reportSize = size
            this.linewrapPoint = size.width / 9
        },
        selectLog (evt, row) {
            parseMessage(row.raw, data => {
                const log = {
                    beacon: data.beacon,
                    gateway: data.gateway,
                    timestamp: moment(data.timestamp).format('L LTS'),
                    rssi: data.rssi
                }
                if (data.advertisement) {
                    log.advertisement = data.advertisement
                    log.advertisement.raw = data.advertisement.raw.toString('hex').toUpperCase()
                    if (log.advertisement.manufacturerData) {
                        log.advertisement.manufacturerData.raw = log.advertisement.manufacturerData.raw.toString('hex').toUpperCase()
                    }
                }
                if (data.gnss) {
                    log.gnss = data.gnss
                    log.gnss.fixTimestamp = moment(data.gnss.fixTimestamp).format('L LTS')
                }
                this.selectedLog = log
                this.detailDialog = true
            })
        }
    },
    computed: {
        rssiFilter: {
            get () { return this.$store.state.db.rssiThreshold },
            set (v) { this.$store.dispatch('db/setRssiThreshold', v) }
        }
    }
}
</script>
