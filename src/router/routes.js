const routes = [
    {
        path: '/',
        component: () => import('layouts/MyLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('pages/Dashboard.vue')
            },
            {
                path: 'logs',
                component: () => import('pages/LogBrowser.vue')
            },
            {
                path: 'beacons',
                component: () => import('pages/BeaconViewer.vue')
            }
        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue')
    }
]

export default routes
