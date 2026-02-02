export default function Card({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {children}
    </div>
  )
}
