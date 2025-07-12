import viteVueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { PluginOption } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { wrapperEnv } from '../uitls';
export function createVitePlugins(rawEnv: Record<string, string>, mode: string) {
  const isDev = mode === 'development';
  const env = wrapperEnv(rawEnv);
  const vitePlugins: PluginOption[] = [
    vue(),
    vueJsx(),
    tailwindcss(),
    viteVueI18nPlugin({ compositionOnly: true, fullInstall: true, runtimeOnly: true }),
    createHtmlPlugin({ minify: true }),
    isDev &&
      VitePWA({
        injectRegister: false,
        workbox: {
          globPatterns: [],
        },
        manifest: {
          display: 'standalone',
          start_url: '/',
          theme_color: '#ffffff',
          description: '',
          icons: [],
          name: `${env.VITE_APP_TITLE}${isDev ? ' dev' : ''}`,
          short_name: `${env.VITE_APP_TITLE}${isDev ? ' dev' : ''}`,
        },
      }),
  ];

  return vitePlugins;
}
