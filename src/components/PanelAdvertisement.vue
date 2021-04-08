<template>
    <div class="adv-card">
        Advertisement: {{ ad.raw.toString('hex').toUpperCase() }}
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
        <div v-if="ad.manufacturerData">
            <div v-if="ad.manufacturerData.company">
                Company: {{ ad.manufacturerData.company }}
            </div>
            <div v-if="ad.manufacturerData.type">
                Type: {{ ad.manufacturerData.type }}
            </div>
            <!-- Ingics IBSXX -->
            <div v-if="ad.manufacturerData.battery">
                Battery: {{ ad.manufacturerData.battery }}V
            </div>
            <div v-if="Object.keys(ad.manufacturerData).includes('temperature')">
                Temperature: {{ ad.manufacturerData.temperature }}°C
            </div>
            <div v-if="Object.keys(ad.manufacturerData).includes('temperatureExt')">
                External Temperature: {{ ad.manufacturerData.temperatureExt }}°C
            </div>
            <div v-if="Object.keys(ad.manufacturerData).includes('humidity')">
                Humidity: {{ ad.manufacturerData.humidity }}%
            </div>
            <div v-if="Object.keys(ad.manufacturerData).includes('range')">
                Range: {{ ad.manufacturerData.range }} mm
            </div>
            <div v-if="Object.keys(ad.manufacturerData).includes('gp')">
                Atmospheric Pressure: {{ ad.manufacturerData.gp }} hPa
            </div>
            <div v-if="ad.manufacturerData.events">
                Events:
                <transition name="slide-fade" mode="out-in">
                    <span :key="ad.manufacturerData.eventFlag">
                        0x{{ ad.manufacturerData.eventFlag.toString(16) }}
                    </span>
                </transition>
                <span v-if="ad.manufacturerData.eventFlag != 0">
                    ({{ eventList(ad.manufacturerData.events) }})
                </span>
            </div>
            <div v-if="ad.manufacturerData.accel">
                Accelerometer:
                <transition name="slide-fade" mode="out-in">
                    <span :key="ad.manufacturerData.accel.toString()">
                        x {{ ad.manufacturerData.accel.x }},
                        y {{ ad.manufacturerData.accel.y }},
                        z {{ ad.manufacturerData.accel.z }}
                    </span>
                </transition>
                <q-btn
                    flat dense round size="xs"
                    icon="show_chart"
                    color="primary"
                    @click="$emit('showAccelChart')"
                ><q-tooltip>Accelerometer Chart</q-tooltip></q-btn>
            </div>
            <div v-if="ad.manufacturerData.accels">
                Accelerometer:
                <transition name="slide-fade" mode="out-in">
                    <span :key="ad.manufacturerData.accels[0].toString()">
                        x {{ ad.manufacturerData.accels[0].x }},
                        y {{ ad.manufacturerData.accels[0].y }},
                        z {{ ad.manufacturerData.accels[0].z }}
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
            <div v-if="ad.manufacturerData.uuid">
                UUID: {{ ad.manufacturerData.uuid }}
            </div>
            <div v-if="ad.manufacturerData.major">
                Major: {{ ad.manufacturerData.major }}
            </div>
            <div v-if="ad.manufacturerData.minor">
                Minor: {{ ad.manufacturerData.minor }}
            </div>
            <div v-if="ad.manufacturerData.tx">
                Tx Power: {{ ad.manufacturerData.tx }}
            </div>
            <!-- Microsoft -->
            <div v-if="ad.manufacturerData.scenario">
                Scenario: {{ ad.manufacturerData.scenario }}
            </div>
            <div v-if="ad.manufacturerData.slat">
                Slat: {{ ad.manufacturerData.slat }}
            </div>
            <div v-if="ad.manufacturerData.deviceHash">
                Device Hash: {{ ad.manufacturerData.deviceHash }}
            </div>
            <!-- altBeacon -->
            <div v-if="ad.manufacturerData.id">
                Device ID: {{ ad.manufacturerData.id }}
            </div>
            <div v-if="ad.manufacturerData.refrssi">
                Reference RSSI: {{ ad.manufacturerData.refrssi }}
            </div>
            <div v-if="ad.manufacturerData.mfgReserved">
                MFG Reserved: {{ ad.manufacturerData.mfgReserved }}
            </div>
            Manufacture Data:
            <transition name="slide-fade" mode="out-in">
                <span :key="ad.manufacturerData.raw.toString('hex').toUpperCase()">
                    {{ ad.manufacturerData.raw.toString('hex').toUpperCase() }}
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
    name: 'PanelAdvertisement',
    props: ['ad'],
    methods: {
        eventList (events) {
            const ans = []
            const eventNames = ['button', 'moving', 'hall', 'fall', 'detect', 'sensor', 'boot']
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
