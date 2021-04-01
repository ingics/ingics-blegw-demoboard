import { CONSTAT_IDLE } from './constants'

export default function () {
    return {
        status: CONSTAT_IDLE,
        error: null,
        pause: false
    }
}
