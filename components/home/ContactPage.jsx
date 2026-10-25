// Contact page. Markup is shared with the static mirror; behaviour lives in lib/home/site.js.
import { CONTACT_INNER } from "./contactMarkup";

export default function ContactPage() {
  return <section className="pg" id="pg-contact" aria-labelledby="contact-h" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CONTACT_INNER }} />;
}
