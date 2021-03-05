
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
    }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
    routes.push({
        path: '*',
        component: () => import('pages/Error404.vue')
    })
}

export default routes
