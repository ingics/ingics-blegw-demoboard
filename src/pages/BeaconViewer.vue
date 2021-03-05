<template>
    <q-page padding>
        <card-beacon-viewer/>
    </q-page>
</template>

<script>
import CardBeaconViewer from 'components/CardBeaconViewer'
export default {
    name: 'BeaconViewer',
    components: { CardBeaconViewer }
}
</script>
