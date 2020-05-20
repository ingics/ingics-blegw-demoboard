<template>
    <q-card>
        <q-card-section>
            <GChart
                type="LineChart"
                :data="chartData"
                :options="chartOptions"
                @ready="ready"
            ></GChart>
        </q-card-section>
        <q-card-section>
            <q-item tag="label" v-ripple>
                <q-item-section avatar>
                    <q-checkbox v-model="kalman.enable" color="orange" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Apply Kalman Filter</q-item-label>
                    <q-item-label caption>{{ kalmanDesc }}</q-item-label>
                </q-item-section>
            </q-item>
        </q-card-section>
    </q-card>
</template>

<script>
const KalmanFilter = require('kalmanjs')
export default {
    props: ['title', 'rssis'],
    data: () => ({
        loading: false,
        chartlib: null,
        chartOptions: {
            vAxis: {
                format: '##',
                maxValue: -30
            },
            hAxis: {
                format: 'HH:mm:ss'
            },
            legend: { position: 'none' },
            chartArea: {
                width: '90%',
                height: '80%'
            },
            height: 300,
            interpolateNulls: 'relative',
            colors: ['blue', 'orange']
        },
        kalman: {
            r: 0.01,
            q: 16,
            enable: false
        }
    }),
    mounted () {
        this.chartOptions.title = this.title
    },
    computed: {
        kalmanDesc () {
            return `R (system noise): ${this.kalman.r}, Q (measurements noise): ${this.kalman.q}`
        },
        chartData () {
            if (!this.chartlib) {
                return null
            }
            const data = new this.chartlib.visualization.DataTable()
            data.addColumn('datetime', 'Timestamp')
            data.addColumn('number', 'RSSI')
            if (this.kalman.enable) {
                data.addColumn('number', 'RSSI (Kalman)')
                const kf = new KalmanFilter({ R: this.kalman.r, Q: this.kalman.q })
                this.rssis.forEach(v => {
                    data.addRow([new Date(v.ts), v.rssi, kf.filter(v.rssi)])
                })
            } else {
                this.rssis.forEach(v => {
                    data.addRow([new Date(v.ts), v.rssi])
                })
            }
            return data
        }
    },
    methods: {
        ready (chart, api) {
            this.chartlib = api
        }
    }

}
</script>
