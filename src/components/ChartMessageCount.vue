<template>
    <q-card>
        <q-card-section class="q-pa-none">
            <GChart
                type="LineChart"
                :data="chartData"
                :options="chartOptions"
                @ready="ready" />
        </q-card-section>
    </q-card>
</template>

<script>
export default {
    name: 'MessagesChart',
    data () {
        return {
            chartlib: null,
            chartOptions: {
                hAxis: {
                    format: 'mm:ss'
                },
                height: 400,
                legend: { position: 'bottom' },
                title: 'Received Message Count',
                chartArea: {
                    width: '90%',
                    height: '80%'
                }
            }
        }
    },
    methods: {
        ready (chart, api) {
            this.chartlib = api
        }
    },
    computed: {
        chartData () {
            if (!this.chartlib) {
                return null
            }
            return new this.chartlib.visualization.DataTable(this.$store.state.db.messageCountChartData)
        }
    }
}
</script>
