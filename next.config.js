/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    runtimeCaching: [
        {
            urlPattern: /^\/api\/quotes/,
            handler: "NetworkFirst",
            options: {
                cacheName: "quotes-cache",
                expiration: {maxEntries: 10, maxAgeSeconds: 60},   
            },
        },
        {
            urlPattern: /^\/api\/(chart|profile)/,
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