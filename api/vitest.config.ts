import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'api-unit',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    exclude: ['dist', 'node_modules', 'test'],
  },
});
