import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function seoFiles(): Plugin {
  const root = import.meta.dirname
  return {
    name: 'miva-seo-files',
    closeBundle() {
      const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '') || 'https://example.com'
      const paths = ['/', '/founder', '/investor']
      const urls = paths
        .map(
          (path, i) => `  <url>
    <loc>${site}${path === '/' ? '/' : path}</loc>
    <changefreq>${path === '/investor' ? 'daily' : 'weekly'}</changefreq>
    <priority>${i === 0 ? '1.0' : i === 1 ? '0.9' : '0.8'}</priority>
  </url>`,
        )
        .join('\n')

      const outDir = resolve(root, 'dist')
      writeFileSync(
        resolve(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
      )
      writeFileSync(
        resolve(outDir, 'robots.txt'),
        `User-agent: *
Allow: /
Disallow: /investor/

Sitemap: ${site}/sitemap.xml
`,
      )
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), seoFiles()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
