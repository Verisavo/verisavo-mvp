// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function Footer() {
  return (
    <footer className="foot" id="about">
      {" "}
      <div className="foot-in">
        {" "}
        <div className="foot-brand">
          {" "}
          <button type="button" className="logo" data-go="0" aria-label="Verisavo, back to top">{"Verisavo"}</button>
          {" "}
          <span>{"The connected intelligence layer for African markets."}</span>
          {" "}
        </div>
        {" "}
        <div className="foot-bar">
          {" "}
          <span>{"© 2026 Verisavo. All rights reserved."}</span>
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
