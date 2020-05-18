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
                </q-tr>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td auto-width>
                        <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
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
                </q-tr>
                <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%">
                        <div class="text-left">
                            Advertisement: {{ props.row.ad.raw.toString('hex').toUpperCase() }}
                            <div v-if="props.row.ad.flags">
                                Flags: {{ '0x' + props.row.ad.flags.toString(16) }}
                            </div>
                            <div v-if="props.row.ad.localName">
                                Local Name: {{ props.row.ad.localName }}
                            </div>
                            <div v-if="props.row.ad.txPowerLevel">
                                Tx Power Level: {{ props.row.ad.txPowerLevel }}
                            </div>
                            <div v-if="props.row.ad.temperature">
                                Temperature:
                                {{ props.row.ad.temperature }}
                                {{ props.row.ad.temperatureUnit }}
                            </div>
                            <div v-if="props.row.ad.humidity">
                                Humidity: {{ props.row.ad.humidity }}%
                            </div>
                            <div v-if="props.row.ad.objectId">
                                Object ID: {{ props.row.ad.objectId }}
                            </div>
                            <div v-if="props.row.ad.appearance">
                                Appearance: {{ props.row.ad.appearance }}
                            </div>
                            <div
                                v-for="d in props.row.ad.serviceData"
                                :key="d.uuid"
                                >
                                Service Data:
                                UUID 0x{{ d.uuid.toString(16).toUpperCase() }}
                                Data 0x{{ d.data.toString('hex').toUpperCase() }}
                            </div>
                            <div
                                v-for="d in props.row.ad.serviceUuids"
                                :key="d"
                            >
                                Service UUID: {{ d }}
                            </div>
                            <div v-if="props.row.ad.msd">
                                <div v-if="props.row.ad.msd.company">
                                    Company: {{ props.row.ad.msd.company }}
                                </div>
                                <div v-if="props.row.ad.msd.type">
                                    Type: {{ props.row.ad.msd.type }}
                                </div>
                                <!-- Ingics IBSXX -->
                                <div v-if="props.row.ad.msd.battery">
                                    Battery: {{ props.row.ad.msd.battery }}V
                                </div>
                                <div v-if="props.row.ad.msd.temperature">
                                    Temperature: {{ props.row.ad.msd.temperature }}°C
                                </div>
                                <div v-if="props.row.ad.msd.temperatureExt">
                                    External Temperature: {{ props.row.ad.msd.temperatureExt }}°C
                                </div>
                                <div v-if="props.row.ad.msd.humidity">
                                    Humidity: {{ props.row.ad.msd.humidity }}%
                                </div>
                                <div v-if="props.row.ad.msd.events">
                                    Events:
                                    <transition name="slide-fade" mode="out-in">
                                        <span :key="props.row.ad.msd.eventFlag">
                                            0x{{ props.row.ad.msd.eventFlag.toString(16) }}
                                        </span>
                                    </transition>
                                </div>
                                <div v-if="props.row.ad.msd.accel">
                                    Accelerometer:
                                    <transition name="slide-fade" mode="out-in">
                                        <span :key="props.row.ad.msd.accel.toString()">
                                            x {{ props.row.ad.msd.accel.x }},
                                            y {{ props.row.ad.msd.accel.y }},
                                            z {{ props.row.ad.msd.accel.z }}
                                        </span>
                                    </transition>
                                </div>
                                <div v-if="props.row.ad.msd.accels">
                                    Accelerometer:
                                    <transition name="slide-fade" mode="out-in">
                                        <span :key="props.row.ad.msd.accels[0].toString()">
                                            x {{ props.row.ad.msd.accels[0].x }},
                                            y {{ props.row.ad.msd.accels[0].y }},
                                            z {{ props.row.ad.msd.accels[0].z }}
                                        </span>
                                    </transition>
                                </div>
                                <!-- iBeacon -->
                                <div v-if="props.row.ad.msd.uuid">
                                    UUID: {{ props.row.ad.msd.uuid }}
                                </div>
                                <div v-if="props.row.ad.msd.major">
                                    Major: {{ props.row.ad.msd.major }}
                                </div>
                                <div v-if="props.row.ad.msd.minor">
                                    Minor: {{ props.row.ad.msd.minor }}
                                </div>
                                <div v-if="props.row.ad.msd.tx">
                                    Tx Power: {{ props.row.ad.msd.tx }}
                                </div>
                                <!-- Microsoft -->
                                <div v-if="props.row.ad.msd.scenario">
                                    Scenario: {{ props.row.ad.msd.scenario }}
                                </div>
                                <div v-if="props.row.ad.msd.slat">
                                    Slat: {{ props.row.ad.msd.slat }}
                                </div>
                                <div v-if="props.row.ad.msd.deviceHash">
                                    Device Hash: {{ props.row.ad.msd.deviceHash }}
                                </div>
                                <!-- altBeacon -->
                                <div v-if="props.row.ad.msd.id">
                                    Device ID: {{ props.row.ad.msd.id }}
                                </div>
                                <div v-if="props.row.ad.msd.refrssi">
                                    Reference RSSI: {{ props.row.ad.msd.refrssi }}
                                </div>
                                <div v-if="props.row.ad.msd.mfgReserved">
                                    MFG Reserved: {{ props.row.ad.msd.mfgReserved }}
                                </div>
                                Manufacture Data:
                                <transition name="slide-fade" mode="out-in">
                                    <span :key="props.row.ad.msd.raw.toString('hex')">
                                        {{ props.row.ad.msd.raw.toString('hex').toUpperCase() }}
                                    </span>
                                </transition>
                            </div>
                        </div>
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
export default {
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
                    name: 'rssi',
                    required: true,
                    label: 'RSSI',
                    align: 'center',
                    field: row => row.rssi,
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
            filterDialog: false
        }
    },
    methods: {
        doFilter (rows, terms, cols, getCellValue) {
            const s = terms.search.toLowerCase()
            return rows.filter(row => {
                if (row === false) return false
                const ad = row.ad
                const msd = row.ad.msd
                return (
                    row.mac.toLowerCase().indexOf(s) !== -1 ||
                    ad.raw.toString('hex').toLowerCase().indexOf(s) !== -1 ||
                    (msd && msd.company && msd.company.toLowerCase().indexOf(s) !== -1) ||
                    (msd && msd.type && msd.type.toLowerCase().indexOf(s) !== -1)
                ) && row.rssi > terms.rssi
            })
        }
    }
}
</script>
