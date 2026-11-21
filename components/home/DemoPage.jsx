// Request a demo page. Markup is shared with the static mirror; behaviour lives in lib/home/site.js.
import { DEMO_INNER } from "./demoMarkup";

export default function DemoPage() {
  return <section className="pg" id="pg-demo" aria-labelledby="demo-h" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DEMO_INNER }} />;
}
