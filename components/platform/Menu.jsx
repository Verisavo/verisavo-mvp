// Converted from the original static page. Markup only: behaviour lives in lib/platform/.
export default function Menu() {
  return (
    <div className="mnav" id="vmenu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
      {" "}
      <div className="mnav-main">
        {" "}
        <ul className="mnav-big">
          <li style={{ "--i": "0" }}><button type="button" data-mn="platform">{"Product"}</button></li>
          <li style={{ "--i": "1" }}><a href="/insights">{"Insights"}</a></li>
          <li style={{ "--i": "2" }}><a href="/docs.html">{"Docs"}</a></li>
          <li style={{ "--i": "3" }}><a href="/pricing">{"Pricing"}</a></li>
        </ul>
        <ul className="mnav-small">
          <li style={{ "--i": "5" }}><a href="/about">{"About us"}</a></li>
          <li style={{ "--i": "6" }}><a href="/careers">{"Careers"}</a></li>
          <li style={{ "--i": "7" }}><a href="/contact">{"Contact us"}</a></li>
          <li style={{ "--i": "8" }}><button type="button" data-login="">{"Sign in"}</button></li>
        </ul>
        {" "}
      </div>
      {" "}
      <div className="mnav-foot">
        {" "}
        <span>{"© 2026 Verisavo. All rights reserved."}</span>
        {" "}
        <nav aria-label="Legal">
          <button type="button" data-legal="terms">{"Terms"}</button>
          <button type="button" data-legal="privacy">{"Privacy"}</button>
        </nav>
        {" "}
      </div>
      {" "}
    </div>
  );
}
