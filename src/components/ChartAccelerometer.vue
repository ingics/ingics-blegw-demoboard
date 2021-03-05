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
            <q-toggle v-model="slope" label="Show Slope" />
        </q-card-section>
    </q-card>
</template>

<script>
const moment = require('moment')
export default {
    name: 'ChartAccelerometer',
    props: ['title', 'mac'],
    data: () => ({
        loading: false,
        chartlib: null,
        chartOptions: {
            hAxis: {
                format: 'HH:mm:ss'
            },
            legend: {
                position: 'bottom'
            },
            chartArea: {
                width: '90%'
            },
            crosshair: {
                trigger: 'both',
                orientation: 'vertical'
            },
            height: 400,
            interpolateNulls: 'relative',
            colors: ['blue', 'orange', 'green']
        },
        slope: false,
        accels: null
    }),
    mounted () {
        this.chartOptions.title = this.title
        this.accels = this.$store.getters['db/beacon'](this.mac).accels
    },
    computed: {
        chartData () {
            if (!this.chartlib) {
                return null
            }
            const data = new this.chartlib.visualization.DataTable()
            data.addColumn('datetime', 'Timestamp')
            if (this.slope) {
                data.addColumn('number', 'X-Slope')
                data.addColumn({ type: 'string', role: 'tooltip' })
                data.addColumn('number', 'Y-Slope')
                data.addColumn({ type: 'string', role: 'tooltip' })
                this.accels.forEach(v => {
                    const slopex = this.calculateSlope(v.accel.x, v.accel.y, v.accel.z)
                    const slopey = this.calculateSlope(v.accel.y, v.accel.x, v.accel.z)
                    const tooltip = moment(v.ts).format('lll') + '\nX: ' + slopex.toFixed(2) + '\u00B0\nY: ' + slopey.toFixed(2) + '\u00B0'
                    data.addRow([new Date(v.ts), slopex, tooltip, slopey, tooltip])
                })
            } else {
                data.addColumn('number', 'x')
                data.addColumn({ type: 'string', role: 'tooltip' })
                data.addColumn('number', 'y')
                data.addColumn({ type: 'string', role: 'tooltip' })
                data.addColumn('number', 'z')
                data.addColumn({ type: 'string', role: 'tooltip' })
                this.accels.forEach(v => {
                    const tooltip = moment(v.ts).format('lll') + '\n' +
                        'X: ' + v.accel.x + ' (' + (v.accel.x / 250).toFixed(2) + 'g)\n' +
                        'Y: ' + v.accel.y + ' (' + (v.accel.y / 250).toFixed(2) + 'g)\n' +
                        'Z: ' + v.accel.z + ' (' + (v.accel.z / 250).toFixed(2) + 'g)'
                    data.addRow([new Date(v.ts), v.accel.x, tooltip, v.accel.y, tooltip, v.accel.z, tooltip])
                })
            }
            return data
        }
    },
    methods: {
        ready (chart, api) {
            this.chartlib = api
        },
        calculateSlope (x, y, z) {
            if (y === 0 && z === 0) {
                return (x >= 0) ? 90 : -90
            }
            return Math.atan(x / Math.sqrt(Math.pow(y, 2) + Math.pow(z, 2))) * 180 / Math.PI
        }
    }

}
</script>
