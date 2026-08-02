export default async function Home() {
  // Contoh memanggil API health server di development
  let health = { status: 'unknown' }
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/health` : 'http://localhost:3001/api/health', { cache: 'no-store' })
    if (res.ok) health = await res.json()
  } catch (e) {
    // gagal fetch -> tetap tampilkan UI
  }

  return (
    <section>
      <h2>Welcome to KerjainYu</h2>
      <p>Client (Next.js app router) sudah siap.</p>
      <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
        <h3>Server health</h3>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </div>
    </section>
  )
}
