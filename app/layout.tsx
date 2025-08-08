export const metadata = {
  title: 'Humorous',
  description: 'Created by Aprameya Kannan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <style>{`
          body {
            margin: 0;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #18181b;
            color: #fafafa;
            min-height: 100vh;
          }
          main {
            max-width: 600px;
            margin: 3rem auto;
            background: #232326;
            border-radius: 1.5rem;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            padding: 2.5rem;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #facc15;
            text-align: center;
          }
          nav {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 2rem;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }
          a:hover {
            color: #facc15;
          }
          ul {
            padding-left: 1.2rem;
          }
          section h2 {
            color: #38bdf8;
            margin-top: 2rem;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
