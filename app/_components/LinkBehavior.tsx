'use client';

import { forwardRef } from 'react';
import NextLink, { type LinkProps } from 'next/link';

const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, 'href'> & { href: LinkProps['href'] }
>(function LinkBehavior(props, ref) {
  const { href, ...other } = props;
  return <NextLink ref={ref} href={href} {...other} />;
});

export default LinkBehavior;
