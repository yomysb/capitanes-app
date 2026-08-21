import Link from 'next/link'

export default function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex flex-col items-center px-2 text-xs text-slate-400 hover:text-orange-400">
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  )
}
