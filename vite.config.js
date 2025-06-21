import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            include: '**/*.{jsx,tsx}',
        }),
    ],
    root: '.',
    // The public directory is 'public' by default, but it's good to be explicit.
    // This ensures that anything in 'public' is copied directly to the build output.
    publicDir: 'public',
    build: {
        outDir: 'dist',
        // By setting assetsInlineLimit to 0, we prevent Vite from trying to
        // inline smaller assets (like fonts) as base64 URLs, which can sometimes
        // cause issues. This forces all assets to be treated as separate files.
        assetsInlineLimit: 0,
    }
});
