
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Disable TypeScript checking during build for faster builds
      tsDecorators: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // Aggressive build optimizations
    minify: 'esbuild',
    sourcemap: false,
    // Disable CSS code splitting for faster builds
    cssCodeSplit: false,
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 2000,
    // Faster build with less checking
    reportCompressedSize: false,
    rollupOptions: {
      // Exclude Supabase functions from build (they're Deno, not part of frontend)
      external: [],
      output: {
        manualChunks: (id) => {
          // More aggressive chunking for faster builds
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // All other node_modules in one chunk
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    // Only open browser in local development, not in CI/CD
    open: process.env.NODE_ENV !== 'production' && !process.env.CI,
    fs: {
      // Don't serve files outside of project root
      strict: true,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Exclude Supabase functions from being processed
  publicDir: 'public',
});