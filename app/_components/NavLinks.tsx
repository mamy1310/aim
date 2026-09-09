'use client';

import { usePathname } from 'next/navigation';
import Link from '@mui/material/Link';

export default function NavLinks({ items }: { items: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const isRoute = item.href.startsWith('/') && !item.href.includes('#');
        const current = isRoute && (pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            underline="none"
            sx={{
              fontSize: '14px',
              color: current ? 'text.primary' : 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
