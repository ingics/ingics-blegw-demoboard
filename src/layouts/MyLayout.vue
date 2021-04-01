<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn
            v-if="$route.fullPath !== '/'"
            flat dense round
            icon="keyboard_arrow_left"
            @click="$router.push('/')"
        />
        <q-toolbar-title>
            <q-avatar
                icon='radio_button_checked'
                :text-color="connectionStatusColor"
            />
            {{ title }}
        </q-toolbar-title>
        <q-btn
            flat dense round
            icon="settings"
            @click="showConfiguration = !showConfiguration"
        ><q-tooltip>Configuration</q-tooltip></q-btn>
        <q-btn
            flat dense round
            icon="info"
            @click="aboutDialog = true"
        ></q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-2">
        <q-banner v-if="$store.state.connection.error" inline-actions class="bg-red-5 text-white">
            {{ $store.state.connection.error }}
            <template v-slot:action>
                <q-btn flat color="white" label="STOP" @click="$store.dispatch('connection/disconnect')" />
            </template>
        </q-banner>
        <router-view />
        <q-page-sticky position="bottom-right" :offset="[18, 18]" class="q-mt-md">
            <q-btn
                v-if="$store.state.connection.status === 'idle'"
                fab dense
                icon-right="play_arrow"
                color="green"
                label='Connect'
                @click="$store.dispatch('connection/connect')"
            />
            <q-btn
                v-if="$store.state.connection.status != 'idle'"
                fab dense
                icon-right="stop"
                color="red"
                label='Stop'
                @click="$store.dispatch('connection/disconnect'); $router.push('/')"
            />
        </q-page-sticky>
        <dialog-connection-setting v-model="showConfiguration" />
        <q-dialog v-model="aboutDialog">
            <q-card :style="{minWidth: '30vw'}">
                <q-card-section>
                    <q-item-section>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Version: {{ appVersion }}</q-item-label>
                        <q-item-label>Commit: {{ appHash }}</q-item-label>
                        <q-item-label>NodeJS: {{ nodejsVersion }}</q-item-label>
                        <q-item-label>Vue: {{ vueVersion }}</q-item-label>
                        <q-item-label>Quasar: {{ $q.version }}</q-item-label>
                        <q-item-label>Electron: {{ electronVersion }}</q-item-label>
                        <q-item-label>Parser: {{ parserVersion }}</q-item-label>
                    </q-item-section>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page-container>

  </q-layout>
</template>

<script>
import Vue from 'vue'
import DialogConnectionSetting from 'components/DialogConnectionSetting'
import { CONSTAT_ERROR, CONSTAT_IDLE, CONSTAT_OK } from 'src/store/connection/constants'
export default {
    name: 'MyLayout',
    components: {
        DialogConnectionSetting
    },
    data () {
        return {
            showConfiguration: false,
            aboutDialog: false
        }
    },
    computed: {
        /**
         * @returns {string} subject of current configuration
         */
        title () {
            return this.$store.getters['cfg/name']
        },
        /** @return {string} color for indicate connection status */
        connectionStatusColor () {
            switch (this.$store.state.connection.status) {
            case CONSTAT_OK: return 'green-6'
            case CONSTAT_IDLE: return 'white'
            case CONSTAT_ERROR: return 'red-5'
            default: return 'grey'
            }
        },
        appHash: () => process.env.APP_HASH,
        appVersion: () => process.env.APP_VERSION,
        electronVersion: () => process.env.ELECTRON_VERSION,
        vueVersion: () => Vue.version,
        nodejsVersion: () => process.version,
        parserVersion: () => process.env.PARSER_VERSION
    },
    mounted () {
        this.showConfiguration = true
    }
}
</script>
