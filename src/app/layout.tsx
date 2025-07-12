import './globals.css';

export const metadata = {
  title: 'Simple Invoice',
  description: 'Simple Invoice Management Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
