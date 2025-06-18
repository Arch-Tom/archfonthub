import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcss from './postcss.config.js'; // Explicitly import the PostCSS config

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Ensure React plugin processes .jsx and .tsx files
            include: '**/*.{jsx,tsx}',
        }),
    ],
    // Explicitly set the CSS options
    css: {
        postcss,
    },
    // 'root' specifies the base directory for resolving entry points
    // '.' means the directory where vite.config.js itself is located (your project root)
    root: '.',

    // 'publicDir' specifies the directory where static assets are located.
    publicDir: 'public',

    build: {
        // 'outDir' specifies the output directory for the build.
        outDir: 'dist',
    }
});