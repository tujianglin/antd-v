// build.mjs
import { readdirSync } from 'fs'; // ✅ 从 fs 导入
import { resolve } from 'path'; // ✅ 从 path 导入
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// === 第一次构建：主库 ===
console.log('📦 构建主包...');
await build({
  configFile: 'vite.config.js',
});
console.log('✅ 主包构建完成\n');

// === 第二次构建：locale ===
console.log('📦 构建 locale 文件...');
const localeDir = resolve(__dirname, 'src/components/locale');
const localeEntries = Object.fromEntries(
  readdirSync(localeDir)
    .filter((f) => /\.(ts|js)$/.test(f))
    .map((f) => [f.replace(/\.(ts|js)$/, ''), resolve(localeDir, f)]),
);

await build({
  configFile: false, // 独立构建，不使用主配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // ✅ 手动补上别名
    },
  },
  build: {
    rollupOptions: {
      input: localeEntries,
      output: {
        dir: 'dist/components/locale',
        format: 'es',
        entryFileNames: '[name].js',
      },
      treeshake: false,
      preserveEntrySignatures: 'strict',
    },
    outDir: 'dist/components/locale',
    emptyOutDir: true,
  },
});
console.log('✅ locale 构建完成 → dist/locale\n');
