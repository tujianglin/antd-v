import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { wrapperEnv } from './build/uitls';
import { createVitePlugins } from './build/vite/index';

const externals = ['vue'];

export default defineConfig(({ command, mode }) => {
  const root = process.cwd();
  const isBuild = command === 'build';
  const rawEnv = loadEnv(mode, root);
  const env = wrapperEnv(rawEnv);
  return {
    plugins: createVitePlugins(rawEnv, mode),
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
      port: env.VITE_PORT,
    },
  };
});
