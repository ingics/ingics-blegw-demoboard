<template>
    <q-page padding>
        <card-log-browser />
    </q-page>
</template>

<script>
import CardLogBrowser from 'components/CardLogBrowser'
export default {
    name: 'LogBrowser',
    components: { CardLogBrowser }
}
</script>
