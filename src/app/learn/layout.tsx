import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
