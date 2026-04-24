'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  locale: string;
  destinationName?: string;
}

export function Breadcrumb({ locale, destinationName }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="bg-[#F5F5F5] py-2">
      <div className="max-w-[1200px] mx-auto px-4">
        <ol className="flex items-center gap-1 text-sm font-normal">
          <li>
            <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </li>
          <li>
            <Link href={`/${locale}/browse`} className="text-gray-600 hover:text-gray-900">
              Destinations
            </Link>
          </li>
          {destinationName && (
            <>
              <li>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </li>
              <li>
                <span className="text-accent font-normal">{destinationName}</span>
              </li>
            </>
          )}
        </ol>
      </div>
    </nav>
  );
}
