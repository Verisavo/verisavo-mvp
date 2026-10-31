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
        <nav className="foot-cols" aria-label="Footer"><div><h3>{"Product"}</h3><a href="/platform">{"Overview"}</a><a href="/pricing">{"Pricing"}</a><a href="/docs">{"Docs"}</a><button type="button" data-dialog="signin">{"Sign in"}</button><button type="button" data-admin="">{"Admin"}</button></div><div><h3>{"Company"}</h3><a href="/about">{"About us"}</a><a href="/careers">{"Careers"}</a><a href="/contact">{"Contact us"}</a><a href="mailto:hello@verisavo.com?subject=Investor%20enquiry">{"For investors"}</a></div><div><h3>{"Insights"}</h3><a href="/insights">{"Research"}</a><a href="/insights">{"Articles"}</a><a href="/insights">{"Case studies"}</a></div></nav>
        <div className="foot-bar">
          {" "}
          <span>{"© "}<span id="year">{"2026"}</span>{" Verisavo. All rights reserved."}</span>
          {" "}
          <nav aria-label="Legal">
            <button type="button" data-legal="terms">{"Terms of Service"}</button>
            <button type="button" data-legal="privacy">{"Privacy Policy"}</button>
          </nav>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </footer>
  );
}
