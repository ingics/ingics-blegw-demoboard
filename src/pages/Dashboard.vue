<template>
    <q-page padding>
        <q-card class="bg-transparent no-shadow no-border">
            <div class="row q-col-gutter-sm">
                <div class="q-pa-none q-ml-xs col items-stretch">
                    <q-item
                        :style="`background-color: ${connectionStatusColor}`"
                        class="q-pa-none q-ml-xs"
                    >
                        <q-item-section class=" q-pa-md q-ml-none  text-white">
                            <q-item-label class="text-white text-h6 text-weight-bolder">
                                {{ connectionStatus }}
                            </q-item-label>
                            <q-item-label> Connection State </q-item-label>
                        </q-item-section>
                        <q-item-section side class="q-mr-md text-white">
                            <q-icon name="cable" color="white" size="44px"/>
                        </q-item-section>
                    </q-item>
                </div>
                <div class="q-pa-none q-ml-xs col items-stretch">
                    <q-item
                        :clickable="$store.state.connection.status === 'ok'"
                        style="background-color: #5064b5"
                        class="q-pa-none q-ml-xs"
                        @click="$router.push('/logs')"
                    >
                        <q-tooltip>Switch to Log Browser</q-tooltip>
                        <q-item-section class=" q-pa-md q-ml-none text-white">
                            <q-item-label class="text-white text-h6 text-weight-bolder">
                                {{ messageCount }}
                            </q-item-label>
                            <q-item-label># of Messages / Min</q-item-label>
                        </q-item-section>
                        <q-item-section side class="q-mr-md text-white">
                            <q-icon name="message" color="white" size="44px" />
                        </q-item-section>
                    </q-item>
                </div>
                <div class="q-pa-none q-ml-xs col items-stretch">
                    <q-item
                        :clickable="$store.state.connection.status === 'ok'"
                        style="background-color: #a270b1"
                        class="q-pa-none q-ml-xs"
                        @click="$router.push('/beacons')"
                    >
                        <q-tooltip>Switch to Beacon Viewer</q-tooltip>
                        <q-item-section class=" q-pa-md q-ml-none  text-white">
                            <q-item-label class="text-white text-h6 text-weight-bolder">
                                {{ beaconCount }}
                            </q-item-label>
                            <q-item-label># of Beacons</q-item-label>
                        </q-item-section>
                        <q-item-section side class="q-mr-md text-white">
                            <q-icon name="sell" color="white" size="44px"></q-icon>
                        </q-item-section>
                    </q-item>
                </div>
            </div>
        </q-card>
        <chart-message-count class="q-pa-none q-mt-sm no-shadow no-border" />
    </q-page>
</template>

<script>
import ChartMessageCount from 'components/ChartMessageCount'
import { CONSTAT_ERROR, CONSTAT_IDLE, CONSTAT_OK } from 'src/store/connection/constants'
export default {
    name: 'Dashboard',
    components: {
        ChartMessageCount
    },
    computed: {
        /** @return {string} connection status */
        connectionStatus () {
            switch (this.$store.state.connection.status) {
            case CONSTAT_OK:
                return this.$store.state.connection.pause ? 'Paused' : 'Connected'
            case CONSTAT_IDLE: return 'Disconnected'
            case CONSTAT_ERROR: return 'Error'
            default: return 'Unknown'
            }
        },
        /** @return {string} color for indicate connection status */
        connectionStatusColor () {
            switch (this.$store.state.connection.status) {
            case CONSTAT_OK:
                return this.$store.state.connection.pause ? '#3a9688' : '#7cb342'
            case CONSTAT_IDLE: return '#f88c2b'
            case CONSTAT_ERROR: return '#ea6a7f'
            default: return 'grey'
            }
        },
        /** @return {number} beacon count */
        beaconCount () {
            return this.$store.state.db.beacons.length
        },
        /** @return {number} message count */
        messageCount () {
            return `${this.$store.state.db.messageCounter}`
        }
    }
}
</script>
