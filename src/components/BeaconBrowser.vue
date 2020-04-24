<template>
    <div>
        <q-table
            title="Beacons"
            :data="beacons"
            :columns="columns"
            hide-bottom
            :filter="filter"
            :grid="!$q.screen.gt.md"
            :pagination.sync="pageOption"
            class="q-pa-md"
        >
            <template v-slot:top-right>
                <q-input outlined borderless dense debounce="300" v-model="filter" placeholder="Search">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:item="props">
                <div class="q-pa-sm col-xs-12 col-sm-6 col-md-4">
                    <q-card>
                        <q-card-section>
                            <q-list>
                                <q-item>
                                    <q-item-section>
                                        <q-item-label
                                            class="q-table__grid-item-title"
                                        >MAC</q-item-label>
                                        <q-item-label
                                            class="q-table__grid-item-value"
                                        >{{ props.row.mac }}</q-item-label>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label
                                            class="q-table__grid-item-title"
                                        >RSSI</q-item-label>
                                        <q-item-label
                                            class="q-table__grid-item-value"
                                        >{{ props.row.rssi }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-item>
                                    <q-item-section>
                                        <q-item-label
                                            class="q-table__grid-item-title"
                                        >Last Update At</q-item-label>
                                        <q-item-label
                                            class="q-table__grid-item-value"
                                        >{{ props.row.timestamp }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-item>
                                    <q-item-section>
                                        <q-item-label
                                            class="q-table__grid-item-title"
                                        >Message</q-item-label>
                                        <q-item-label
                                            class="q-table__grid-item-value"
                                        >{{ props.row.message }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-card-section>
                    </q-card>
                </div>
            </template>
        </q-table>
    </div>
</template>

<script>
import moment from 'moment'
export default {
    // name: 'ComponentName',
    props: {
        beacons: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            columns: [
                {
                    name: 'mac',
                    required: true,
                    label: 'MAC',
                    align: 'left',
                    field: row => row.mac,
                    sortable: false
                },
                {
                    name: 'rssi',
                    required: true,
                    label: 'RSSI',
                    align: 'center',
                    field: row => row.rssi,
                    sortable: false
                },
                {
                    name: 'timestamp',
                    required: true,
                    label: 'Last Update',
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
                    sortable: false
                }
            ],
            pageOption: {
                rowsPerPage: 0,
                sortBy: undefined
            },
            filter: ''
        }
    }
}
</script>
