import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// The 'path' module is not needed if we are not explicitly using path.resolve for input

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Ensure React plugin processes .jsx and .tsx files
      include: '**/*.{jsx,tsx}',
    }),
  ],
  // 'root' specifies the base directory for resolving entry points
  // '.' means the directory where vite.config.js itself is located (your project root)
  root: '.', 
  
  // 'publicDir' specifies the directory where static assets (like index.html, favicon, fonts) are located.
  // Files in publicDir are copied directly to the root of the build output (dist/).
  publicDir: 'public', 

  build: {
    // 'outDir' specifies the output directory for the build.
    outDir: 'dist', 
    
    // REMOVED explicit rollupOptions.input:
    // Vite typically infers the HTML entry point from the 'root' and 'publicDir'.
    // The <script type="module" src="/src/main.jsx"></script> in public/index.html
    // is what tells Vite where your main JS entry is.
    // Explicitly setting input: { main: 'public/index.html' } can sometimes cause Rollup
    // to misinterpret index.html as a direct module to bundle, leading to this error.
    // By removing it, we rely on Vite's default, correct behavior.
  }
});
