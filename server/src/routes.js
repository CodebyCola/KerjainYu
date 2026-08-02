export async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  // Health
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }))
    return true
  }

  // Simple tasks endpoint (in-memory sample)
  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    const tasks = [
      { id: 't1', title: 'Contoh tugas', done: false }
    ]
    res.statusCode = 200
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ tasks }))
    return true
  }

  return false
}
