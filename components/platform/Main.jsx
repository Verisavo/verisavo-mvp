import Capabilities from "./Capabilities";
// Converted from the original static page. Markup only: behaviour lives in lib/platform/.
export default function Main() {
  return (
    <main id="main">
      {" "}
      <section className="hero" aria-labelledby="hero-title">
        {" "}
        <canvas id="net" aria-hidden="true"></canvas>
        {" "}
        <div className="wrap hero-grid">
          {" "}
          <div className="hero-title">
            {" "}
            <h1 id="hero-title">
              <span className="l1">{"Understand the market"}</span>
              {" "}
              <span className="tone">{"around your business."}</span>
            </h1>
            {" "}
            <p className="sub">{"We connect scattered market evidence, so you see what is happening and what is still unknown."}</p>
            {" "}
          </div>
          {" "}
          <div className="hero-actions">
            {" "}
            <button type="button" className="btn btn-rect solid" id="ask-cta">{"Ask Verisavo"}</button>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </section>
      {" "}
      <section className="stage-sec" aria-label="Ask Verisavo">
        {" "}
        <div className="wrap">
          {" "}
          <div className="stage" id="product">
            {" "}
            <div className="stage-bg">
              <canvas className="pfield" id="pfield" aria-hidden="true"></canvas>
              <p className="pf-cap" id="pf-cap" aria-hidden="true"></p>
            </div>
            {" "}
            <div className="pcard">
              {" "}
              <form className="chat dark" id="ask-form" noValidate>
                {" "}
                <button type="button" className="chat-theme" id="chat-theme" aria-pressed="false" aria-label="Switch to dark mode" title="Switch to dark mode">
                  <svg className="ct-moon" viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 12.3A6 6 0 0 1 7.7 4.5a6 6 0 1 0 7.8 7.8z"></path></svg>
                  <svg className="ct-sun" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="10" cy="10" r="3.2"></circle>
                    <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3L6 14M14 6l1.3-1.3"></path>
                  </svg>
                </button>
                {" "}
                <label className="vh" htmlFor="ask-input">{"What do you need to understand?"}</label>
                {" "}
                <div className="chat-body">
                  {" "}
                  <textarea id="ask-input" rows="2" maxLength="500" placeholder="Where should we launch our product first?" />
                  {" "}
                </div>
                {" "}
                <ul className="att-list" id="att-list" aria-label="Attached files" hidden></ul>
                {" "}
                <div className="chat-foot">
                  {" "}
                  <div className="chips" role="group" aria-label="Example questions">
                    {" "}
                    <div className="attach">
                      {" "}
                      <button type="button" className="add-btn" id="add-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="add-menu" aria-label="Add files or choose a market">
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"></path>
                        </svg>
                      </button>
                      {" "}
                      <div className="add-menu" id="add-menu" role="menu" aria-label="Add to your question" hidden>
                        {" "}
                        <button type="button" role="menuitem" data-pick="pick-image">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <rect x="2.5" y="3.5" width="13" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"></rect>
                            <circle cx="6.5" cy="7.3" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.3"></circle>
                            <path d="M3 13l4-4 3 3 2-2 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path>
                          </svg>
                          {"Add images"}
                        </button>
                        {" "}
                        <button type="button" role="menuitem" data-pick="pick-file">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <path d="M5 2.5h5.5L14 6v9.5H5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path>
                            <path d="M10.5 2.5V6H14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path>
                          </svg>
                          {"Add files"}
                        </button>
                        {" "}
                        <button type="button" role="menuitem" id="pick-market" className="add-sep">
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M8 14.5s4.5-4.2 4.5-7.8a4.5 4.5 0 0 0-9 0c0 3.6 4.5 7.8 4.5 7.8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path>
                            <circle cx="8" cy="6.6" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.4"></circle>
                          </svg>
                          {"Choose market"}
                          <span className="add-val" id="pick-market-val">{"All markets"}</span>
                        </button>
                        {" "}
                      </div>
                      {" "}
                      <ul className="place-menu" id="place-menu" role="menu" aria-label="Choose a market" hidden>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="true" data-place="All markets">{"All markets"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Nigeria">{"Nigeria"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Ghana">{"Ghana"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Kenya">{"Kenya"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="South Africa">{"South Africa"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Côte d’Ivoire">{"Côte d’Ivoire"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Egypt">{"Egypt"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Morocco">{"Morocco"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Senegal">{"Senegal"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Ethiopia">{"Ethiopia"}</button>
                        </li>
                        <li>
                          <button type="button" role="menuitemradio" aria-checked="false" data-place="Tanzania">{"Tanzania"}</button>
                        </li>
                      </ul>
                      {" "}
                      <input type="file" id="pick-image" accept="image/*" multiple hidden />
                      {" "}
                      <input type="file" id="pick-file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,image/*" multiple hidden />
                      {" "}
                    </div>
                    {" "}
                    <span className="place-tag" id="place-tag" hidden>
                      <button type="button" className="place-tag-b" id="place-tag-b" aria-label="Change market">
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M8 14.5s4.5-4.2 4.5-7.8a4.5 4.5 0 0 0-9 0c0 3.6 4.5 7.8 4.5 7.8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path>
                          <circle cx="8" cy="6.6" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.4"></circle>
                        </svg>
                        <span id="place-label">{"All markets"}</span>
                      </button>
                      <button type="button" className="place-tag-x" id="place-tag-x" aria-label="Clear market">
                        <svg viewBox="0 0 10 10" aria-hidden="true">
                          <path d="M2 2l6 6M8 2l-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                        </svg>
                      </button>
                    </span>
                    {" "}
                    <button type="button" className="chip" aria-pressed="false" data-q="What does the market for our product look like?">{"Explore a market"}</button>
                    {" "}
                    <button type="button" className="chip" aria-pressed="false" data-q="Where should we launch first?">{"Compare locations"}</button>
                    {" "}
                    <button type="button" className="chip" aria-pressed="false" data-q="What don't we know yet that could change our plan?">{"Investigate a gap"}</button>
                    {" "}
                  </div>
                  {" "}
                  <button type="submit" className="send-q">
                    {"Send question "}
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M3 9l6-6M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                  {" "}
                </div>
                {" "}
                <p className="ask-note" id="ask-note" aria-live="polite"></p>
                {" "}
              </form>
              {" "}
              <p className="ask-promise">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 1.8l5 1.9v4.1c0 3-2 5.3-5 6.6-3-1.3-5-3.6-5-6.6V3.7z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"></path>
                  <path d="M5.8 8.1l1.5 1.5 2.9-3.1" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                {"Every answer shows the evidence behind it, how confident it is, and what is still unknown."}
              </p>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </section>
      {" "}
<section className="sec sample" id="sample" aria-label="Sources">
  <div className="wrap">
    <p className="src-strip"><span className="src-k">Built from</span><span className="src-v">Company data</span><span className="src-v">Public records</span><span className="src-v">Digital platforms</span><span className="src-v">Market research</span><span className="src-v">SavoScouts</span></p>
    </div>
</section>
      <Capabilities />
      {" "}
      <section className="band" id="platform" aria-labelledby="platform-title">
        {" "}
        <div className="wrap">
          {" "}
          <div className="band-head">
            {" "}
            <h2 id="platform-title">{"The connected intelligence layer for African markets."}</h2>
            {" "}
            <p>
              {"Verisavo connects what the market shows with what your company knows, supported by verified Ground-Level Intelligence."}
            </p>
            {" "}
          </div>
          {" "}
          <div className="cmp-ex"><p className="cmp-ex-k">Exhibit 1</p><p className="cmp-ex-t">How Verisavo differs from general-purpose AI</p></div><div className="cmp">
        <table>
          <caption className="vh">How Verisavo differs from general AI tools</caption>
          <thead><tr><th scope="col"><span className="vh">Question</span></th><th scope="col">General-purpose AI</th><th scope="col" className="cmp-v"><span className="cmp-badge">Verisavo</span></th></tr></thead><tbody><tr><th scope="row"><span className="cmp-n">01</span>Where answers come from</th><td><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><span>Its training data, plus whatever it can find online.</span></span></td><td className="cmp-v"><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><span>Your company data, public records, digital platforms, research and checks on the ground, connected around your question.</span></span></td></tr><tr><th scope="row"><span className="cmp-n">02</span>Can you check the answer?</th><td><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><span>Sources are often missing, generic or hard to trace.</span></span></td><td className="cmp-v"><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><span>Every claim links to its source, place and date, with a note on how reliable it is.</span></span></td></tr><tr><th scope="row"><span className="cmp-n">03</span>When the evidence runs out</th><td><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><span>It may still give a fluent, confident answer.</span></span></td><td className="cmp-v"><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><span>It says Unknown, names the Intelligence Gap and what would close it.</span></span></td></tr><tr><th scope="row"><span className="cmp-n">04</span>Markets that are barely online</th><td><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><span>Little to go on where most trade happens in shops and open markets.</span></span></td><td className="cmp-v"><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><span>SavoScouts can check prices, stock and shelves on the ground, and the findings are verified before they are used.</span></span></td></tr><tr><th scope="row"><span className="cmp-n">05</span>The next time you ask</th><td><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><span>Usually starts again from what it can see today.</span></span></td><td className="cmp-v"><span className="cmp-c"><svg className="cmp-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><span>Market Memory is designed to keep what was found, and show what has changed since.</span></span></td></tr></tbody>
        </table>
      </div><p className="cmp-src">Source: Verisavo. General-purpose AI describes the typical behaviour of widely available assistants; individual tools vary.</p>
        </div>
      </section>
      {" "}

      {" "}
      {" "}
      
      {" "}

      {" "}
      <div className="cta-wrap">
        {" "}
        <div className="wrap">
          {" "}
          <div className="cta">
            {" "}
            <p className="eyebrow">{"Ask. Understand. Act."}</p>
            {" "}
            <h2>{"Make your next move"}<br />{"with confidence."}</h2>
            {" "}
            <p>
              {"Understand your market, see what the evidence supports and uncover what’s missing before you act."}
            </p>
            {" "}
            <div className="ctas">
              {" "}
              <button type="button" className="btn btn-blue" data-access="">{"Get early access"}</button>
              {" "}
              <a className="btn btn-outline-w" href="/docs.html">{"Read the Docs"}</a>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </main>
  );
}
