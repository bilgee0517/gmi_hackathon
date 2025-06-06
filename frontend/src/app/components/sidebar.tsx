'use client';

import Link from 'next/link';
import { sidebarLinks } from '@/constants/nav';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <nav className="space-y-2">
          {sidebarLinks.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                pathname === href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
