import Link from 'next/link';

export interface BreadcrumbLink {
  title: string;
  uri: string;
}

export default function Breadcrumbs({ links }: { links: BreadcrumbLink[] }) {
  return (
    <div>
      {links.map(({ title, uri }, i) => (
        <span key={i}>
          <Link href={uri}>
            <a>{title}</a>
          </Link>
          {i !== links.length - 1 ? ' > ' : ''}
        </span>
      ))}
    </div>
  );
}
