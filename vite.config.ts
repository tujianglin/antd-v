import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const externals = ['vue'];

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    plugins: [vue(), vueJsx(), tailwindcss()],
    build: {
      rollupOptions: {
        external: [...externals],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
      esbuild: {
        drop: isBuild ? ['debugger'] : [],
        legalComments: 'none',
      },
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'index',
        fileName: 'index',
      },
    },
    resolve: {
      dedupe: ['vue'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 1814,
      proxy: {
        '/api': {
          target: 'http://192.168.40.222:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
