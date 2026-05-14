import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import motionCanvasPlugin from '@motion-canvas/vite-plugin';

// CJS package loaded as ESM: real fn lives at .default in some Node versions.
const motionCanvas =
  (motionCanvasPlugin as unknown as {default?: typeof motionCanvasPlugin}).default ??
  motionCanvasPlugin;

export default defineConfig({
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  plugins: [
    motionCanvas({
      project: './src/videos/*/project.ts',
    }),
  ],
});
