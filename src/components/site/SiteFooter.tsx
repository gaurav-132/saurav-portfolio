import Link from 'next/link';
import type { SiteProfile } from '@/domain/types';

export default function SiteFooter({ profile }: { profile: SiteProfile }) {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span className="brand">SAURAV <i>GUSAIN</i></span>
        <span>{profile.roleTitle} · © {new Date().getFullYear()}</span>
        <Link href="/admin" className="muted-link">Admin</Link>
      </div>
    </footer>
  );
}
