<template>
    <div>
        <q-table
            :data="beacons"
            :columns="columns"
            hide-bottom
            :filter="filter"
            :pagination.sync="pageOption"
            class="q-pa-md"
            :filter-method="doFilter"
            row-key="mac"
        >
            <template v-slot:top-left>
                <p class="adjust-center">
                    <span class="q-table__title">Beacons</span>
                    <q-btn
                        flat dense round
                        icon="refresh"
                        color="primary"
                        @click="$store.commit('db/clearBeacons')"
                    ><q-tooltip>Refresh</q-tooltip></q-btn>
                </p>
            </template>
            <template v-slot:top-right>
                <q-input
                    class="q-mx-xs"
                    rounded outlined borderless dense debounce="300"
                    v-model="filter.search" placeholder="Search"
                >
                    <template v-slot:prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-select
                    class="q-mx-xs"
                    style="min-width: 120px"
                    rounded outlined borderless dense label="Retain Time"
                    v-model="ttl" :options="ttls" emit-value map-options
                >
                    <template v-slot:prepend><q-icon name="timer" /></template>
                </q-select>
                <q-select
                    class="q-mx-xs"
                    style="min-width: 110px"
                    rounded outlined borderless dense label="RSSI Filter"
                    v-model="rssiFilter" :options="rssiThresholds" emit-value map-options
                >
                    <template v-slot:prepend><q-icon name="filter_list" /></template>
                </q-select>
                <!-- <q-btn
                    flat round
                    icon="filter_list"
                    @click="filterDialog = !filterDialog"
                ><q-tooltip>Filter</q-tooltip></q-btn> -->
            </template>
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th auto-width />
                    <q-th
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                    >
                        {{ col.label }}
                    </q-th>
                    <q-th auto-width>
                        RSSI
                    </q-th>
                </q-tr>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn
                            size="sm" color="accent" round dense
                            @click="onRowExpand(props)"
                            :icon="rowExpandIcon(props)"
                            :disabled="autoExpand" />
                    </q-td>
                    <q-td
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                    >
                        <transition name="slide-fade" mode="out-in">
                            <div :key="col.value">{{ col.value }}</div>
                        </transition>
                    </q-td>
                    <q-td>
                        <q-item>
                            <q-item-section>
                                <transition name="slide-fade" mode="out-in">
                                    <div :key="props.row.rssi">{{ props.row.rssi }}</div>
                                </transition>
                            </q-item-section>
                            <q-item-section>
                                <q-btn
                                    flat dense round
                                    icon="show_chart"
                                    color="primary"
                                    @click="showRssiChart(props.row)"
                                ><q-tooltip>RSSI Chart</q-tooltip></q-btn>
                            </q-item-section>
                        </q-item>
                    </q-td>
                </q-tr>
                <q-tr v-show="props.expand || autoExpand" :props="props">
                    <q-td colspan="100%">
                        <panel-advertisement
                            :ad="props.row.advertisement"
                            @showAccelChart="showAccelChart(props.row)"
                        />
                    </q-td>
                </q-tr>
            </template>
        </q-table>
        <!-- <q-dialog v-model="filterDialog">
            <q-card class="q-pa-md" :style="{minWidth: '65vw'}">
                <q-item>
                    <q-item-section avatar class="q-pr-sm">
                        <q-icon color="primary" name="equalizer" />
                    </q-item-section>
                    <q-item-section>
                        <q-slider
                            v-model="rssiFilter"
                            :min="-125"
                            :max="0"
                            label
                            :label-value="'RSSI threshold ' + filter.rssi"
                        />
                    </q-item-section>
                </q-item>
            </q-card>
        </q-dialog> -->
        <q-dialog v-model="rssiChart.dialog">
            <q-card class="q-pa-md" :style="{minWidth: '75vw'}">
                <chart-rssi :title="rssiChart.title" :mac="rssiChart.mac" />
            </q-card >
        </q-dialog>
        <q-dialog v-model="accelChart.dialog">
            <q-card class="q-pa-md" :style="{minWidth: '75vw'}">
                <chart-accelerometer :title="accelChart.title" :mac="accelChart.mac" />
            </q-card>
        </q-dialog>
    </div>
</template>

<style scoped>
.slide-fade-enter-active {
    transition: all .1s ease;
}
.slide-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for <2.1.8 */ {
    transform: translateX(5px);
    opacity: 0;
}
</style>

<script>
import moment from 'moment'
import ChartRssi from './ChartRssi.vue'
import PanelAdvertisement from './PanelAdvertisement.vue'
import ChartAccelerometer from './ChartAccelerometer.vue'
export default {
    name: 'CardBeaconViewer',
    components: {
        PanelAdvertisement,
        ChartRssi,
        ChartAccelerometer
    },
    data () {
        return {
            columns: [
                {
                    name: 'name',
                    lable: 'Name',
                    align: 'left',
                    field: row => {
                        if (row.advertisement.localName) {
                            return row.advertisement.localName
                        } else if (row.advertisement.manufacturerData && row.advertisement.manufacturerData.type) {
                            return row.advertisement.manufacturerData.type
                        }
                        return '(NaN)'
                    },
                    sortable: true
                },
                {
                    name: 'mac',
                    required: true,
                    label: 'MAC',
                    align: 'left',
                    field: row => row.mac,
                    sortable: true
                },
                {
                    name: 'timestamp',
                    required: true,
                    label: 'Last Update',
                    align: 'left',
                    field: row => row.timestamp,
                    format: val => `${moment(val).format('L LTS')}`,
                    sortable: true
                }
            ],
            pageOption: {
                rowsPerPage: 0,
                sortBy: undefined
            },
            filter: {
                search: ''
            },
            // filterDialog: false,
            rssiChart: {
                dialog: false,
                mac: '',
                title: ''
            },
            accelChart: {
                dialog: false,
                mac: '',
                title: ''
            },
            autoExpand: false,
            ttls: [
                { label: '10 seconds', value: 10 },
                { label: '30 seconds', value: 30 },
                { label: '1 minute', value: 60 },
                { label: '3 minutes', value: 180 },
                { label: '5 minutes', value: 300 }
            ],
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
    computed: {
        beacons () {
            return this.$store.state.db.beacons
        },
        ttl: {
            get () { return this.$store.state.db.beaconTTL },
            set (v) { this.$store.dispatch('db/setBeaconTTL', v) }
        },
        rssiFilter: {
            get () { return this.$store.state.db.rssiThreshold },
            set (v) { this.$store.dispatch('db/setRssiThreshold', v) }
        }
    },
    methods: {
        doFilter (rows, terms, cols, getCellValue) {
            const me = this
            const s = terms.search.toUpperCase()
            const result = rows.filter(row => {
                if (row === false) return false
                const ad = row.advertisement
                const msd = ad.manufacturerData
                return (
                    row.mac.toUpperCase().indexOf(s) !== -1 ||
                    ad.raw.toString('hex').toUpperCase().indexOf(s) !== -1 ||
                    (msd && msd.company && msd.company.toUpperCase().indexOf(s) !== -1) ||
                    (msd && msd.type && msd.type.toUpperCase().indexOf(s) !== -1)
                ) && row.rssi > me.rssiFilter
            })
            this.autoExpand = result.length <= 2
            return result
        },
        chartTitle (row) {
            if (row.advertisement.localName) {
                return `${row.advertisement.localName} (${row.mac})`
            } else if (row.advertisement.msd && row.advertisement.msd.type) {
                return `${row.advertisement.msd.type} (${row.mac})`
            } else {
                return `Beacon MAC: ${row.mac}`
            }
        },
        showRssiChart (row) {
            this.rssiChart.title = this.chartTitle(row)
            this.rssiChart.mac = row.mac
            this.rssiChart.dialog = true
        },
        showAccelChart (row) {
            this.accelChart.title = this.chartTitle(row)
            this.accelChart.mac = row.mac
            this.accelChart.dialog = true
        },
        onRowExpand (props) {
            props.expand = !(props.expand || this.autoExpand)
        },
        rowExpandIcon (props) {
            return (props.expand || this.autoExpand) ? 'remove' : 'add'
        }
    }
}
</script>
