<template>
    <div>
        <q-table
            title="Logs"
            :data="logs"
            :columns="columns"
            hide-header
            hide-bottom
            wrap-cells
            :grid="$q.screen.xs"
            :pagination.sync="pageOption"
            class="q-pa-md"
            @row-click="selectLog"
        ></q-table>
        <q-resize-observer @resize="onResize" />
        <q-dialog v-model="detailDialog" v-if="selectedLog">
            <q-card class="q-pa-md" :style="{minWidth: '80vw'}">
                <div v-if="!selectedLog.gnss">Beacon: {{ selectedLog.beacon }}</div>
                <div>Gateway: {{ selectedLog.gateway }}</div>
                <div v-if="!selectedLog.gnss">RSSI: {{ selectedLog.rssi }}</div>
                <div>Timestamp: {{ selectedLog.timestamp }}</div>
                <advertisement v-if="selectedLog.advertisement" :ad="selectedLog.advertisement" />
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
import Advertisement from './Advertisement'
import { parseMessage } from '@ingics/message-parser'
export default {
    // name: 'LogBrowser',
    props: {
        logs: {
            type: Array,
            required: true
        }
    },
    components: {
        Advertisement
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
                    field: row => row.timestamp,
                    format: val => `${moment(val).format('L LTS')}`,
                    sortable: false
                },
                {
                    name: 'message',
                    required: true,
                    label: 'Message',
                    align: 'left',
                    field: row => row.message,
                    format: val => val.replace(/,/g, ',\n'), // for content wrap
                    sortable: false
                }
            ],
            pageOption: {
                rowsPerPage: 0
            },
            detailDialog: false,
            selectedLog: undefined
        }
    },
    methods: {
        onResize (size) {
            this.reportSize = size
            this.linewrapPoint = size.width / 9
        },
        selectLog (evt, row) {
            parseMessage(row.message, data => {
                const log = {
                    beacon: data.beacon,
                    gateway: data.gateway,
                    timestamp: moment(data.timestamp).format('L LTS'),
                    rssi: data.rssi
                }
                if (data.advertisement) {
                    log.advertisement = this.advPreprocessing(data.advertisement)
                }
                if (data.gnss) {
                    log.gnss = data.gnss
                    log.gnss.fixTimestamp = moment(data.gnss.fixTimestamp).format('L LTS')
                }
                this.selectedLog = log
                this.detailDialog = true
            })
        }
    }
}
</script>
