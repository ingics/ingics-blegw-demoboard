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
        >
            <template v-slot:body-cell-message="props">
                <q-td :props="props">
                    <div>
                        {{ props.row.message.split(',').slice(0,4).join(',') }}
                    </div>
                    <div>
                        {{ props.row.message.split(',').slice(-1)[0] }}
                    </div>
                </q-td>
            </template>
        </q-table>
        <q-resize-observer @resize="onResize" />
    </div>
</template>

<script>
import moment from 'moment'
export default {
    // name: 'LogBrowser',
    props: {
        logs: {
            type: Array,
            required: true
        }
    },
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
            }
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
        }
    }
}
</script>
