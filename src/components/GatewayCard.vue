<template>
    <q-card class="gateway-card">
        <q-card-section class="gateway-card-header">
            <div class="row items-center no-wrap">
                <div class="col">
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
                    <q-item-label>Host</q-item-label>
                    <q-item-label caption>{{ host }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                    <q-item-label>Port</q-item-label>
                    <q-item-label caption>{{ port }}</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                    <q-item-label>Subscribe Topic</q-item-label>
                    <q-item-label caption>{{ topic }}</q-item-label>
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
            required: true,
            type: String
        }
    },
    data () {
        return {

        }
    }
}
</script>
