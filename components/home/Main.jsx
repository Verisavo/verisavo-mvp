// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function Main() {
  return (
    <main>
      {" "}
      <section id="story" aria-label="How Verisavo works">
        {" "}
        <div className="stage" id="stage">
          {" "}
          <canvas id="gl" aria-hidden="true"></canvas>
          {" "}
          <div className="veil" id="veil"></div>
          {" "}
          <div className="veil-b"></div>
          {" "}
          <div id="ovl" aria-hidden="true"></div>
          {" "}
          <div className="hero" id="hero">
            {" "}
            <h1>{"Connected intelligence for "}<span className="acc">{"every market decision."}</span></h1>
            {" "}
            <p className="sub">{"Understand what is known. See what is missing. Decide what to do next."}</p>
            {" "}
            <div className="hero-links">
              {" "}
              <button type="button" className="tlink" data-ask="">{"Ask Verisavo "}<span aria-hidden="true">{"→"}</span></button>
              {" "}
              <button type="button" className="tlink" data-scout="">{"Deploy a Scout "}<span aria-hidden="true">{"→"}</span></button>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div className="sources" id="sources">
            {" "}
            <div className="grp">
              {" "}
              <ul>
                {" "}
                <li>
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="3" y="4" width="12" height="10" rx="1.5"></rect><path d="M3 7.5h12M7 4v10"></path></svg>
                  {"Company data"}
                </li>
                {" "}
                <li>
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 2.5h6l3 3v10H5z"></path><path d="M11 2.5v3h3M7.5 9h4M7.5 12h4"></path></svg>
                  {"Public records"}
                </li>
                {" "}
                <li>
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <circle cx="9" cy="9" r="6.5"></circle>
                    <path d="M2.5 9h13M9 2.5c2 2 2 11 0 13M9 2.5c-2 2-2 11 0 13"></path>
                  </svg>
                  {"Digital platforms"}
                </li>
                {" "}
                <li>
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M3 15l4-11 4 7 2-3 2 7z"></path></svg>
                  {"Market research"}
                </li>
                {" "}
              </ul>
              {" "}
            </div>
            {" "}
            <span className="sep"></span>
            {" "}
            <div className="grp">
              {" "}
              <ul>
                <li>
                  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M9 16s5-4.7 5-8.5a5 5 0 0 0-10 0C4 11.3 9 16 9 16z"></path>
                    <circle cx="9" cy="7.5" r="1.8"></circle>
                  </svg>
                  {"SavoScouts"}
                </li>
              </ul>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <article className="ch" data-k="1">
            <p className="eb">{"01 / 08 · Signals"}</p>
            <h2>{"Markets never "}<span className="acc">{"stand still."}</span></h2>
            <p>
              {"Prices shift. Products disappear. Customers change. Competitors enter. Distribution evolves. Signals are everywhere."}
            </p>
          </article>
          {" "}
          <article className="ch" data-k="2">
            <p className="eb">{"02 / 08 · Fragmentation"}</p>
            <h2>{"The information exists. "}<span className="acc">{"The understanding does not."}</span></h2>
            <p>
              {"The information needed to understand a market exists, but it is fragmented across sources, systems, people and places."}
            </p>
          </article>
          {" "}
          <article className="ch" data-k="3">
            <p className="eb">{"03 / 08 · Connection"}</p>
            <h2>
              {"Fragmented information"}
              <br className="dbr" />
              {" to "}
              <span className="acc">{"connected"}<br className="dbr" />{" understanding."}</span>
            </h2>
            <p>
              {"Verisavo connects market information, company knowledge and verified ground-level intelligence to reveal what is happening, why it matters and what may come next."}
            </p>
          </article>
          {" "}
          <article className="ch" data-k="4">
            <p className="eb">{"04 / 08 · Evidence"}</p>
            <h2>{"Know what the "}<span className="acc">{"evidence supports."}</span></h2>
            <p>
              {"Every insight remains linked to its source, place, time and reliability, making it easier to distinguish fact, uncertainty and assumptions."}
            </p>
            {" "}
            <div className="legend" aria-label="Intelligence states">
              <span className="chip st-fact">{"Fact"}</span>
              <span className="chip st-inf">{"Inference"}</span>
              <span className="chip st-hyp">{"Hypothesis"}</span>
              <span className="chip st-unk">{"Unknown"}</span>
            </div>
          </article>
          {" "}
          <article className="ch" data-k="5">
            <p className="eb">{"05 / 08 · Intelligence Gaps"}</p>
            <h2>{"See what is "}<span className="acc">{"missing."}</span></h2>
            <p>
              {"When information falls short, Verisavo identifies Intelligence Gaps and highlights the questions that need answers."}
            </p>
            {" "}
            <div className="acts acts-tight">
              <button type="button" className="tlink slink" data-scout="">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M8 14.5s4.5-4.2 4.5-7.6a4.5 4.5 0 0 0-9 0c0 3.4 4.5 7.6 4.5 7.6z"></path>
                  <circle cx="8" cy="6.8" r="1.6"></circle>
                </svg>
                {"Deploy a Scout"}
              </button>
            </div>
          </article>
          {" "}
          <article className="ch" data-k="6">
            <p className="eb">{"06 / 08 · SavoScouts"}</p>
            <h2>{"Investigate the market "}<span className="acc">{"when answers matter."}</span></h2>
            <p>
              {"When critical information is missing, Verisavo can help gather and verify Ground-Level Intelligence through targeted investigations carried out by SavoScouts."}
            </p>
          </article>
          {" "}
          <article className="ch" data-k="7">
            <p className="eb">{"07 / 08 · Market Memory"}</p>
            <h2>{"Build understanding "}<span className="acc">{"over time."}</span></h2>
            <p>
              {"Every question, signal and investigation adds to a growing Market Memory, strengthening future decisions."}
            </p>
            {" "}
            <div className="tl" aria-hidden="true">
              <div className="track">
                <span className="tick" style={{ left: "0%" }}>{"Jul"}</span>
                <span className="tick" style={{ left: "33.3%" }}>{"Aug"}</span>
                <span className="tick" style={{ left: "66.6%" }}>{"Sep"}</span>
                <span className="tick" style={{ left: "100%" }}>{"Now"}</span>
                <i className="now" id="tl-now"></i>
              </div>
            </div>
          </article>
          {" "}
          <article className="ch" data-k="8">
            <p className="eb">{"08 / 08 · Decision"}</p>
            <h2>{"Move with "}<span className="acc">{"greater confidence."}</span></h2>
            <p>
              {"Verisavo helps businesses understand change, compare options, uncover what matters and make better-informed decisions."}
            </p>
          </article>
          {" "}
          <div className="final" id="final">
            {" "}
            <p className="eb">{"Start with a market question"}</p>
            {" "}
            <div className="split">
              {" "}
              <button type="button" data-ask="">
                <h2>{"Ask Verisavo "}<i>{"→"}</i></h2>
                <p>{"Understand what the evidence supports, what remains uncertain and what is still unknown."}</p>
              </button>
              {" "}
              <button type="button" data-soon="">
                <h2>{"Deploy a Scout "}<i>{"→"}</i></h2>
                <p>{"Investigate what is missing with verified Ground-Level Intelligence."}</p>
              </button>
              {" "}
            </div>
            {" "}
            <div className="acts">
              {" "}
              <button type="button" className="dbtn" data-dialog="access">{"Get early access "}<span className="ar">{"→"}</span></button>
              {" "}
              <button type="button" className="dbtn" data-dialog="signin">{"Sign in "}<span className="ar">{"→"}</span></button>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div className="dock">
            {" "}
            <p className="qnote" id="qnote" role="status" hidden></p>
            {" "}
            <form className="qbar" id="qbar" noValidate>
              {" "}
              <span className="caret" aria-hidden="true"></span>
              {" "}
              <label className="vh" htmlFor="q">{"Ask a question about the market"}</label>
              {" "}
              <input id="q" type="text" maxLength="300" autoComplete="off" spellCheck="false" />
              {" "}
              <button type="submit" className="go" aria-label="Ask Verisavo">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l6-6M4 3h5v5"></path></svg>
              </button>
              {" "}
            </form>
            {" "}
            <div className="scroll">
              <button type="button" id="scroll-btn"><span id="scroll-lab">{"Scroll"}</span>{" "}<i aria-hidden="true">{"↓"}</i></button>
              <span className="prog"><i id="prog"></i></span>
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </section>
      {" "}
    </main>
  );
}
