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
