'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Tab {
  name: string;
  href: string;
}

interface TabNavProps {
  tabs: Tab[];
}

export default function TabNav({ tabs }: TabNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-4 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'py-4 px-1 text-sm font-medium border-b-2 transition-colors',
                isActive
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
