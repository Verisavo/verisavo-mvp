import { FOOT } from "./landingMarkup";

export default function Footer() {
  return <footer className="lf" id="about" dangerouslySetInnerHTML={{ __html: FOOT }} />;
}
