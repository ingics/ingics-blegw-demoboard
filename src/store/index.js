import { createStore } from 'vuex'

// import example from './module-example'
import db from './db'
import cfg from './cfg'
import connection from './connection'
import Parser from './parser'
import M2mClient from './m2m-client'
import MqttClient from './mqtt-clien'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
    const Store = createStore({
        modules: {
            db,
            cfg,
            connection
        },

        plugins: [
            new Parser(),
            new M2mClient(),
            new MqttClient()
        ],

        // enable strict mode (adds overhead!)
        // for dev mode and --debug builds only
        strict: process.env.DEBUGGING
    })

    return Store
}
