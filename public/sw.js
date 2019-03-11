// SW Version
const version = '1.0';

// Static Cache - App Shell
const appAssets = [
    'index.html',
    'js/main.js',
    'css/main.css',
    'images/flame.svg',
    'images/logo.svg',
    'images/sync.svg',
    'vendor/bootstrap.min.css'
];

// SW Install
self.addEventListener('install', e => {
    const cacheResources = async () => {
        const cacheStorage = await caches.open(`static-${version}`);
        return cacheStorage.addAll(appAssets);
    };

    e.waitUntil(cacheResources());

    console.log('Install SW and cached static assets.');
});

// SW Activate
self.addEventListener('activate', e => {
    // Clean static cache
    const cleanCache = async () => {
        const cacheKeys = await caches.keys();

        cacheKeys.map(key => key !== `static-${version}` && key.match(`static-`) ? caches.delete(key) : null);
    };

    e.waitUntil(cleanCache());

    console.log('Activate SW and clean static assets cache.');
});

// Static cache strategy - Cache with Network Fallback
const staticCache = async (e, cacheName = `static-${version}`) => {
    const cachedRes = await caches.match(e.request);

    // Return cached response if found 
    if (cachedRes) return cachedRes

    // Fall back to network
    const fetchResp = fetch(e.request);
    const fetchRespCopy = fetchResp.then(r => r.clone());

    // Update cache with new response
    e.waitUntil(async function () {
        const cacheStorage = await caches.open(cacheName);
        await cacheStorage.put(e.request, await fetchRespCopy);
    }());

    return fetchResp;
};

// Network with cache fallback
const fallbackCache = async e => {
    try {
        const fetchResp = fetch(e.request);
        const fetchRespCopy = fetchResp.then(r => r.clone());

        // Cache last version
        const cacheStorage = await caches.open(`static-${version}`);
        await cacheStorage.put(e.request, await fetchRespCopy);

        return fetchResp;
    } catch (err) {
        console.error(err);
        return await caches.match(e.request);
    }
};

// Clear old Giphys from the 'giphy' cache
const cleanGiphyCache = async giphis => {
    const giphyCacheStorage = await caches.open('giphy');
    // Get all caches entries
    const keys = await giphyCacheStorage.keys();
    keys.map(key => !giphis.includes(key.url) && giphyCacheStorage.delete(key));
};

// SW Fetch
self.addEventListener('fetch', e => {
    // App Shell
    if (e.request.url.match(location.origin)) {
        e.respondWith(staticCache(e));
    }

    // Giphy API
    if (e.request.url.match('api.giphy.com/v1/gifs/trending')) {
        e.respondWith(fallbackCache(e))
    }

    // Giphy Media
    if (e.request.url.match('giphy.com/media')) {
        e.respondWith(staticCache(e, 'giphy'));
    }
});

// Listen for message from client
self.addEventListener('message', e => {
    // Identify the message
    if (e.data.action === 'cleanGiphyCache') {
        cleanGiphyCache(e.data.giphys);
    }
});