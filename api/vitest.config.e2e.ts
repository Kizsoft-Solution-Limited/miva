import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const e2eDb = resolve(process.cwd(), 'prisma', 'test-e2e.db');

process.env.DATABASE_URL ??= `file:${e2eDb}`;
process.env.AUTH_SECRET ??= 'e2e-auth-secret';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'api-e2e',
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    exclude: ['dist', 'node_modules'],
    fileParallelism: false,
  },
});
