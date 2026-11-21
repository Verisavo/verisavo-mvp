// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function Header() {
  return (
    <header className="top">
      {" "}
      <button type="button" className="logo" data-go="0" aria-label="Verisavo, back to top">{"Verisavo"}</button>
      {" "}
      <div className="pill">
        {" "}
        <button type="button" className="snd thm" data-theme-toggle="" aria-pressed="false" aria-label="Switch to dark mode" title="Switch to dark mode" suppressHydrationWarning>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="thm-moon" d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z"></path>
            <g className="thm-sun"><circle cx="8" cy="8" r="2.8"></circle><path d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1"></path></g>
          </svg>
        </button>
        {" "}
        {" "}
        <button type="button" className="pa" data-dialog="access">{"Contact us"}</button>
        {" "}
        <button type="button" className="hdemo" data-page="demo">{"Request a demo"}</button>
        <button type="button" id="menu-btn" aria-expanded="false" aria-controls="menu">
          <span id="menu-lab">{"Menu"}</span>
          {" "}
          <svg className="b-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M2 4.5h12M2 8h12M2 11.5h12"></path></svg>
          <svg className="x-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"></path></svg>
        </button>
        {" "}
      </div>
      {" "}
    </header>
  );
}
