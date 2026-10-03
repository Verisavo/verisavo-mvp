// Converted from the original static page. Markup only: behaviour lives in lib/platform/.
export default function Header() {
  return (
    <header className="top" id="top">
      {" "}
      <nav className="wrap nav" aria-label="Main">
        {" "}
        <a className="logo" href="/" aria-label="Verisavo home"><span>{"Verisavo"}</span></a>
        {" "}
        <ul className="links">
          {" "}
          <li><button type="button" data-href="/#about-us">{"About us"}</button></li>
          {" "}
          <li><button type="button" data-scroll="product">{"Platform"}</button></li>
          {" "}
          <li><button type="button" data-scroll="how">{"How it works"}</button></li>
          {" "}
          <li><button type="button" data-scroll="faq">{"FAQs"}</button></li>
          {" "}
        </ul>
        {" "}
        <div className="nav-cta">
          {" "}
          <button type="button" className="snd" data-sound-toggle="" aria-pressed="false" aria-label="Turn sound on" title="Turn sound on">
            <svg className="snd-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"></path>
              <path className="snd-w1" d="M10.4 6.2a2.6 2.6 0 0 1 0 3.6"></path>
              <path className="snd-w2" d="M12.3 4.4a5.1 5.1 0 0 1 0 7.2"></path>
              <path className="snd-x" d="M10.6 6.3l3.4 3.4M14 6.3l-3.4 3.4"></path>
            </svg>
          </button>
          {" "}
          <button type="button" className="login" data-login="">{"Log in"}</button>
          {" "}
          <button type="button" className="vmenu" id="vmenu-btn" aria-expanded="false" aria-controls="vmenu">
            <span id="vmenu-lab">{"Menu"}</span>
            {" "}
            <svg className="b-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M2 4.5h12M2 8h12M2 11.5h12"></path></svg>
            <svg className="x-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"></path></svg>
          </button>
          {" "}
        </div>
        {" "}
      </nav>
      {" "}
    </header>
  );
}
