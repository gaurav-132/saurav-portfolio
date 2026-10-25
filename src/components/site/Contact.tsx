import type { SiteProfile } from '@/domain/types';
import ContactForm from './ContactForm';

export default function Contact({ profile }: { profile: SiteProfile }) {
  return (
    <section className="section wrap">
      <div className="contact glass" id="contact">
        <div className="contact-copy">
          <div className="eyebrow">{profile.contactEyebrow}</div>
          <h2>{profile.contactTitle}</h2>
          <p>{profile.contactCopy}</p>
          {profile.email && <p><a className="muted-link" href={`mailto:${profile.email}`}>{profile.email}</a></p>}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
