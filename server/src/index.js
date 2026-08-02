import http from 'http'
import { router } from './routes.js'

const PORT = process.env.PORT || 3001

const server = http.createServer(async (req, res) => {
  try {
    // simple router
    const handled = await router(req, res)
    if (!handled) {
      res.statusCode = 404
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: 'Not found' }))
    }
  } catch (err) {
    console.error('Unhandled server error', err)
    res.statusCode = 500
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

server.listen(PORT, () => {
  console.log(`KerjainYu server running on http://localhost:${PORT}`)
})
