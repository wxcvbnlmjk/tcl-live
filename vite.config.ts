import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'
import { TCL_GRANDLYON_URL } from './shared/tclApi'

function createTclProxy(login?: string, password?: string): ProxyOptions {
  const proxy: ProxyOptions = {
    target: 'https://data.grandlyon.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/tcl/, new URL(TCL_GRANDLYON_URL).pathname + new URL(TCL_GRANDLYON_URL).search),
    secure: true,
  }

  if (login && password) {
    const authorization = `Basic ${Buffer.from(`${login}:${password}`, 'utf8').toString('base64')}`
    proxy.configure = (proxyServer) => {
      proxyServer.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Authorization', authorization)
      })
    }
    console.log(
      `[tcl-live] Proxy TCL → ${login} (${password.length} caractères dans le mot de passe)`,
    )
  } else {
    console.warn(
      '[tcl-live] Définissez TCL_LOGIN et TCL_PASSWORD dans .env (guillemets obligatoires si le mot de passe contient #).',
    )
  }

  return proxy
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const login = env.TCL_LOGIN
  const password = env.TCL_PASSWORD

  const tclProxy = createTclProxy(login, password)

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        '/api/tcl': tclProxy,
      },
    },
    preview: {
      host: true,
      proxy: {
        '/api/tcl': tclProxy,
      },
    },
  }
})
