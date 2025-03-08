import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/swagger.js'
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "swagger-ui-dist": "/node_modules/swagger-ui-dist", // Ensure correct path resolution
        },
    },
    build: {
        rollupOptions: {
            external: ['swagger-ui-dist'],
        },
    },
});
