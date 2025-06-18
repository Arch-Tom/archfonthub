import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react({
            include: '**/*.{jsx,tsx}',
        }),
    ],
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
    }
});