<script>
export default {
    methods: {
        advPreprocessing (ad) {
            // rename
            ad.msd = ad.manufacturerData
            delete ad.manufacturerData
            // buffer convert
            ad.raw = ad.raw.toString('hex').toUpperCase()
            if (ad.msd) {
                ad.msd.raw = ad.msd.raw.toString('hex').toUpperCase()
            }
            return ad
        }
    }
}
</script>
