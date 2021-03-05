export default function () {
    return {
        beaconTTL: 5,
        messageTTL: 60,
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
