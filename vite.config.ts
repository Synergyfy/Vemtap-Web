import { createLogger, defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

/**
 * Socket.io reconnects every few seconds while the backend is down or
 * restarting, and drops sockets it rejects; Vite logs a stack trace for each.
 * Those collapse into one plain line (at most every 30 s); everything else is
 * logged as usual.
 */
function lanLogger(target: string) {
  const logger = createLogger()
  const error = logger.error.bind(logger)
  let lastDownNotice = 0
  logger.error = (msg, options) => {
    if (msg.includes('ws proxy socket error')) return
    if (msg.includes('ws proxy error')) {
      if (msg.includes('ECONNREFUSED') && Date.now() - lastDownNotice > 30_000) {
        lastDownNotice = Date.now()
        logger.warn(`Backend not reachable at ${target}; live updates reconnect once it is up.`, { timestamp: true })
      }
      return
    }
    error(msg, options)
  }
  return logger
}

// `npm run dev:lan` serves the app on the local network over HTTPS (phones
// only share their location with secure pages) and forwards API and socket
// traffic to the backend on this machine, so a phone never calls "localhost".
export default defineConfig(({ mode }) => {
  const lan = mode === 'lan'
  const target = loadEnv(mode, process.cwd(), '').API_PROXY_TARGET || 'http://localhost:3002'

  return {
    plugins: lan ? [react(), basicSsl()] : [react()],
    customLogger: lan ? lanLogger(target) : undefined,
    server: lan
      ? {
          host: true,
          proxy: {
            '/api': { target, changeOrigin: true },
            '/socket.io': { target, changeOrigin: true, ws: true },
          },
        }
      : undefined,
  }
})
