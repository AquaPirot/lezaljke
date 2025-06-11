import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Aqua caffe&restaurant - Lezaljke',
  description: 'Sistem za kontrolu naplate lezaljki',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}