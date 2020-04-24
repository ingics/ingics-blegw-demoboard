<template>
    <q-card class="gateway-card">
        <q-card-section class="gateway-card-header">
            <div class="row items-center no-wrap">
                <div class="col cursor-pointer" @click="$emit('selected', name)">
                    {{ name }}
                </div>
                <div class="auto-col">
                    <q-btn round flat size=".7rem" icon="settings" @click="$emit('setting', name)" />
                    <q-btn round flat size=".7rem" icon="delete" @click="$emit('delete', name)" />
                </div>
            </div>
        </q-card-section>
        <q-card-section @click="$emit('selected', name)" class="cursor-pointer">
            <q-list>
                <q-item>
                    <q-item-section>
                        <q-item-label class="q-table__grid-item-title">Host</q-item-label>
                        <q-item-label class="q-table__grid-item-value">{{ host }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class="q-table__grid-item-title">Port</q-item-label>
                        <q-item-label class="q-table__grid-item-value">{{ port }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-item-label class="q-table__grid-item-title">Protocol</q-item-label>
                        <q-item-label class="q-table__grid-item-value">{{ app.toUpperCase() }}</q-item-label>
                    </q-item-section>
                    <q-item-section  v-if="app == 'mqtt'">
                        <q-item-label class="q-table__grid-item-title">Subscribe Topic</q-item-label>
                        <q-item-label class="q-table__grid-item-value">{{ topic }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>
    </q-card>
</template>

<style lang="sass" scoped>
    .gateway-card-header
        color: white
        background-color: $primary
</style>

<script>
export default {
    // name: 'GatewayCard',
    props: {
        name: {
            required: true,
            type: String
        },
        host: {
            required: true,
            type: String
        },
        port: {
            required: true,
            type: Number
        },
        topic: {
            type: String
        },
        app: {
            type: String,
            require: true
        }
    },
    data () {
        return {

        }
    }
}
</script>
