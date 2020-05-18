<template>
    <div>
        <q-table
            title="Logs"
            :data="logs"
            :columns="columns"
            hide-header
            hide-bottom
            :grid="$q.screen.xs"
            :pagination.sync="pageOption"
            class="q-pa-md"
        >
            <template v-slot:body-cell-message="props">
                <q-td :props="props" @click="selectLog(props.row.message)">
                    <div v-if="$q.screen.gt.sm">
                        {{ props.row.message }}
                    </div>
                    <div v-if="$q.screen.lt.md">
                        {{ props.row.message.split(',').slice(0,4).join(',') }}
                    </div>
                    <div v-if="$q.screen.lt.md">
                        {{ props.row.message.split(',').slice(-1)[0] }}
                    </div>
                </q-td>
            </template>
        </q-table>
        <q-resize-observer @resize="onResize" />
        <q-dialog v-model="detailDialog" v-if="selectedLog">
            <q-card class="q-pa-md" :style="{minWidth: '80vw'}">
                <div>Beacon: {{ selectedLog.beacon }}</div>
                <div>Gateway: {{ selectedLog.gateway }}</div>
                <div>RSSI: {{ selectedLog.rssi }}</div>
                <div>Timestamp: {{ selectedLog.timestamp }}</div>
                <advertisement :ad="selectedLog.advertisement" />
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
                    format: val => this.formatMessage(val),
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
        formatMessage (message) {
            if (this.$q.screen.xs) {
                // handle manual line-wrap
                const fields = message.split(',')
                const formatted = [fields.slice(0, 4).join(',')]
                let payload = fields.slice(-1)[0]
                while (payload.length > this.linewrapPoint) {
                    formatted.push(payload.substring(0, this.linewrapPoint))
                    payload = payload.slice(this.linewrapPoint)
                }
                formatted.push(payload)
                return formatted.join('\n')
            } else {
                return message
            }
        },
        onResize (size) {
            this.reportSize = size
            this.linewrapPoint = size.width / 9
        },
        selectLog (message) {
            parseMessage(message, data => {
                this.selectedLog = {
                    beacon: data.beacon,
                    gateway: data.gateway,
                    timestamp: moment(data.timestamp).format('L LTS'),
                    rssi: data.rssi,
                    advertisement: this.advPreprocessing(data.advertisement)
                }
                this.detailDialog = true
            })
        }
    }
}
</script>
