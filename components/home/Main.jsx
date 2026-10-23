import { MAIN } from "./landingMarkup";

// The homepage. Markup only: behaviour lives in lib/home/landing.js.
export default function Main() {
  return <main className="ln v3" id="ln" dangerouslySetInnerHTML={{ __html: MAIN }} />;
}
