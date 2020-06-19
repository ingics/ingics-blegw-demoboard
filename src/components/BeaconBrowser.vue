<template>
    <div>
        <q-table
            title="Beacons"
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
                    <span class="q-table__title">Beacon</span>
                    <q-btn
                        flat dense round
                        icon="refresh"
                        color="primary"
                        @click="$emit('beacon-refresh')"
                    ><q-tooltip>Refresh</q-tooltip></q-btn>
                </p>
            </template>
            <template v-slot:top-right>
                <q-input
                    outlined borderless dense debounce="300"
                    v-model="filter.search" placeholder="Search"
                >
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
                <q-btn
                    flat round
                    icon="filter_list"
                    @click="filterDialog = !filterDialog"
                ><q-tooltip>Filter</q-tooltip></q-btn>
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
                        <advertisement :ad="props.row.ad" @showAccelChart="showAccelChart(props.row)" />
                    </q-td>
                </q-tr>
            </template>
        </q-table>
        <q-dialog v-model="filterDialog">
            <q-card class="q-pa-md" :style="{minWidth: '65vw'}">
                <q-item>
                    <q-item-section avatar class="q-pr-sm">
                        <q-icon color="primary" name="equalizer" />
                    </q-item-section>
                    <q-item-section>
                        <q-slider
                            v-model="filter.rssi"
                            :min="-125"
                            :max="0"
                            label
                            :label-value="'RSSI threshold ' + filter.rssi"
                        />
                    </q-item-section>
                </q-item>
            </q-card>
        </q-dialog>
        <q-dialog v-model="rssiChart.dialog">
            <q-card class="q-pa-md" :style="{minWidth: '75vw'}">
                <rssi-chart :title="rssiChart.title" :rssis="rssiChart.data" />
            </q-card >
        </q-dialog>
        <q-dialog v-model="accelChart.dialog">
            <q-card class="q-pa-md" :style="{minWidth: '75vw'}">
                <acceleroment-chart :title="accelChart.title" :accels="accelChart.data" />
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
import RssiChart from './RssiChart'
import Advertisement from './Advertisement'
import AcceleromentChart from './AccelerometerChart'
export default {
    props: {
        beacons: {
            type: Array,
            required: true
        }
    },
    components: {
        RssiChart,
        Advertisement,
        AcceleromentChart
    },
    data () {
        return {
            columns: [
                {
                    name: 'name',
                    lable: 'Name',
                    align: 'left',
                    field: row => {
                        if (row.ad.localName) {
                            return row.ad.localName
                        } else if (row.ad.msd && row.ad.msd.type) {
                            return row.ad.msd.type
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
                rssi: -100,
                search: ''
            },
            filterDialog: false,
            rssiChart: {
                dialog: false,
                data: [],
                title: ''
            },
            accelChart: {
                dialog: false,
                data: [],
                title: ''
            },
            autoExpand: false
        }
    },
    methods: {
        doFilter (rows, terms, cols, getCellValue) {
            const s = terms.search.toUpperCase()
            const result = rows.filter(row => {
                if (row === false) return false
                const ad = row.ad
                const msd = row.ad.msd
                return (
                    row.mac.toUpperCase().indexOf(s) !== -1 ||
                    ad.raw.indexOf(s) !== -1 ||
                    (msd && msd.company && msd.company.toUpperCase().indexOf(s) !== -1) ||
                    (msd && msd.type && msd.type.toUpperCase().indexOf(s) !== -1)
                ) && row.rssi > terms.rssi
            })
            this.autoExpand = result.length <= 2
            return result
        },
        chartTitle (row) {
            if (row.ad.localName) {
                return `${row.ad.localName} (${row.mac})`
            } else if (row.ad.msd && row.ad.msd.type) {
                return `${row.ad.msd.type} (${row.mac})`
            } else {
                return row.mac
            }
        },
        showRssiChart (row) {
            this.rssiChart.title = this.chartTitle(row)
            this.rssiChart.data = row.rssis
            this.rssiChart.dialog = true
        },
        showAccelChart (row) {
            this.accelChart.title = this.chartTitle(row)
            this.accelChart.data = row.accels
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
