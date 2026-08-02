import './globals.css'

export const metadata = {
  title: 'KerjainYu',
  description: 'Collaborative workspace'
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <header style={{ padding: 16, borderBottom: '1px solid #eaeaea' }}>
          <h1>KerjainYu</h1>
          <p style={{ marginTop: 4 }}>Collaborative workspace — contoh app router Next.js</p>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  )
}
