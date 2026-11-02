"use client";
// Converted from the original static page. Markup only: behaviour lives in lib/platform/.
export default function Footer() {
  return (
    <footer className="foot">
      {" "}
      <div className="foot-in">
        {" "}
        <div className="foot-brand">
          {" "}
          <a className="logo" href="/" aria-label="Verisavo home"><span>{"Verisavo"}</span></a>
          {" "}
          <span>{"The connected intelligence layer for African markets."}</span>
          {" "}
        </div>
        {" "}
        {" "}
        <nav className="foot-cols foot-min" aria-label="Footer"><a href="/platform">{"Product"}</a><a href="/use-cases">{"Use cases"}</a><a href="/pricing">{"Pricing"}</a><a href="/insights">{"Insights"}</a><a href="/docs">{"Docs"}</a><a href="/about">{"About us"}</a><a href="/careers">{"Careers"}</a><a href="/community">{"Community"}</a><a href="/contact">{"Contact us"}</a></nav>
        <div className="foot-bar">
          {" "}
          <span>{"© "}<span id="year">{"2026"}</span>{" Verisavo. All rights reserved."}</span>
          {" "}
          <nav aria-label="Legal">
            <button type="button" data-admin="">{"Admin"}</button>
            <button type="button" data-legal="terms">{"Terms of Service"}</button>
            <button type="button" data-legal="privacy">{"Privacy Policy"}</button>
            <button type="button" className="foot-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>{"Back to top ↑"}</button>
          </nav>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </footer>
  );
}
