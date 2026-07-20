import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Strip Next.js server/client boundary directives that confuse Vite
const stripNextDirectives = {
  name: 'strip-next-directives',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (/\.(tsx?|jsx?)$/.test(id)) {
      return { code: code.replace(/^['"]use (client|server)['"]\s*\n?/m, ''), map: null }
    }
  },
}

export default defineConfig({
  plugins: [stripNextDirectives, react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
