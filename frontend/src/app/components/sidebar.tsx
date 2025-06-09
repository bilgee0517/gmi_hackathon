'use client';

import Link from 'next/link';
import { sidebarLinks } from '@/constants/nav';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200/50 h-screen transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarLinks.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={isCollapsed ? name : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'} transition-colors duration-200`} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200/50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
            <PlusIcon className="h-4 w-4" />
            New Project
          </button>
        </div>
      )}
    </div>
  );
}