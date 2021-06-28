export default function () {
    return {
        rssiThreshold: -80,
        beaconTTL: 60,
        messageTTL: 10,
        maxMessages: 100,
        totalMessages: 0,
        beacons: [],
        messages: [],
        messageCounter: 0,
        messageCountChartData: {
            cols: [
                { id: 'ts', label: 'Timestamp', type: 'datetime' },
                { id: 'cnt', label: '# of Messages', type: 'number' }
            ],
            rows: []
        }
    }
}
