export const metadata = {
  title: 'Blueprint — Life Audit',
  description: 'Turn your Pinterest board into actionable habits',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
