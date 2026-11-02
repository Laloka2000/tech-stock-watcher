/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching: [
        {
            // Workbox matches against the full URL, so test the pathname instead
            urlPattern: ({ url }) => url.pathname.startsWith("/api/quotes"),
            handler: "NetworkFirst",
            options: {
                cacheName: "quotes-cache",
                expiration: {maxEntries: 10, maxAgeSeconds: 60},   
            },
        },
        {
            urlPattern: ({ url }) => /^\/api\/(chart|profile)/.test(url.pathname),
            handler: "CacheFirst",
            options: {
                cacheName: "fundamentals-cache",
                expiration: {maxEntries: 50, maxAgeSeconds: 86400},
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts",
                expiration: {maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60},
            },
        },
        {
            urlPattern: /^https?.*$/,
            handler: "NetworkFirst",
            options: {
                cacheName: "offline-cache",
                expiration: {maxEntries: 200},
            },
        },
    ],
});

const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_APP_NAME: "Tech Stock Watcher",
    },
};

module.exports = withPWA(nextConfig);