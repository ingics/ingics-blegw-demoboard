<template>
    <div class="gateway-card">
        Advertisement: {{ ad.raw }}
        <div v-if="ad.flags">
            Flags: {{ '0x' + ad.flags.toString(16) }}
        </div>
        <div v-if="ad.localName">
            Local Name: {{ ad.localName }}
        </div>
        <div v-if="ad.txPowerLevel">
            Tx Power Level: {{ ad.txPowerLevel }}
        </div>
        <div v-if="ad.temperature">
            Temperature:
            {{ ad.temperature }}
            {{ ad.temperatureUnit }}
        </div>
        <div v-if="ad.humidity">
            Humidity: {{ ad.humidity }}%
        </div>
        <div v-if="ad.objectId">
            Object ID: {{ ad.objectId }}
        </div>
        <div v-if="ad.appearance">
            Appearance: {{ ad.appearance }}
        </div>
        <div
            v-for="d in ad.serviceData"
            :key="d.uuid"
            >
            Service Data:
            UUID 0x{{ d.uuid.toString(16).toUpperCase() }}
            Data 0x{{ d.data.toString('hex').toUpperCase() }}
        </div>
        <div
            v-for="d in ad.serviceUuids"
            :key="d"
        >
            Service UUID: {{ d }}
        </div>
        <div v-if="ad.msd">
            <div v-if="ad.msd.company">
                Company: {{ ad.msd.company }}
            </div>
            <div v-if="ad.msd.type">
                Type: {{ ad.msd.type }}
            </div>
            <!-- Ingics IBSXX -->
            <div v-if="ad.msd.battery">
                Battery: {{ ad.msd.battery }}V
            </div>
            <div v-if="ad.msd.temperature">
                Temperature: {{ ad.msd.temperature }}°C
            </div>
            <div v-if="ad.msd.temperatureExt">
                External Temperature: {{ ad.msd.temperatureExt }}°C
            </div>
            <div v-if="ad.msd.humidity">
                Humidity: {{ ad.msd.humidity }}%
            </div>
            <div v-if="ad.msd.events">
                Events:
                <transition name="slide-fade" mode="out-in">
                    <span :key="ad.msd.eventFlag">
                        0x{{ ad.msd.eventFlag.toString(16) }}
                    </span>
                </transition>
                <span v-if="ad.msd.eventFlag != 0">
                    ({{ eventList(ad.msd.events) }})
                </span>
            </div>
            <div v-if="ad.msd.accel">
                Accelerometer:
                <transition name="slide-fade" mode="out-in">
                    <span :key="ad.msd.accel.toString()">
                        x {{ ad.msd.accel.x }},
                        y {{ ad.msd.accel.y }},
                        z {{ ad.msd.accel.z }}
                    </span>
                </transition>
                <q-btn
                    flat dense round size="xs"
                    icon="show_chart"
                    color="primary"
                    @click="$emit('showAccelChart')"
                ><q-tooltip>Accelerometer Chart</q-tooltip></q-btn>
            </div>
            <div v-if="ad.msd.accels">
                Accelerometer:
                <transition name="slide-fade" mode="out-in">
                    <span :key="ad.msd.accels[0].toString()">
                        x {{ ad.msd.accels[0].x }},
                        y {{ ad.msd.accels[0].y }},
                        z {{ ad.msd.accels[0].z }}
                    </span>
                </transition>
                <q-btn
                    flat dense round size="xs"
                    icon="show_chart"
                    color="primary"
                    @click="$emit('showAccelChart')"
                ><q-tooltip>Accelerometer Chart</q-tooltip></q-btn>
            </div>
            <!-- iBeacon -->
            <div v-if="ad.msd.uuid">
                UUID: {{ ad.msd.uuid }}
            </div>
            <div v-if="ad.msd.major">
                Major: {{ ad.msd.major }}
            </div>
            <div v-if="ad.msd.minor">
                Minor: {{ ad.msd.minor }}
            </div>
            <div v-if="ad.msd.tx">
                Tx Power: {{ ad.msd.tx }}
            </div>
            <!-- Microsoft -->
            <div v-if="ad.msd.scenario">
                Scenario: {{ ad.msd.scenario }}
            </div>
            <div v-if="ad.msd.slat">
                Slat: {{ ad.msd.slat }}
            </div>
            <div v-if="ad.msd.deviceHash">
                Device Hash: {{ ad.msd.deviceHash }}
            </div>
            <!-- altBeacon -->
            <div v-if="ad.msd.id">
                Device ID: {{ ad.msd.id }}
            </div>
            <div v-if="ad.msd.refrssi">
                Reference RSSI: {{ ad.msd.refrssi }}
            </div>
            <div v-if="ad.msd.mfgReserved">
                MFG Reserved: {{ ad.msd.mfgReserved }}
            </div>
            Manufacture Data:
            <transition name="slide-fade" mode="out-in">
                <span :key="ad.msd.raw">
                    {{ ad.msd.raw }}
                </span>
            </transition>
        </div>
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
export default {
    name: 'Advertisement',
    props: ['ad'],
    methods: {
        eventList (events) {
            const ans = []
            const eventNames = ['button', 'moving', 'hall', 'fall', 'detect', 'matt']
            eventNames.forEach(e => {
                if (e in events && events[e]) {
                    ans.push(e)
                }
            })
            return ans.join(', ')
        }
    }
}
</script>
