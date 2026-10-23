import { MAIN } from "./landingMarkup";

// The homepage. Markup only: behaviour lives in lib/home/landing.js.
export default function Main() {
  return <main className="ln" id="ln" dangerouslySetInnerHTML={{ __html: MAIN }} />;
}
