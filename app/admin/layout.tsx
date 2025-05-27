export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {/* You can add a specific admin navigation bar here */}
      <nav>
        Admin Navigation
      </nav>
      {children}
    </section>
  )
}