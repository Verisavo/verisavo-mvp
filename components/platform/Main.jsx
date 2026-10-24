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
          <div className="cmp">
        <table>
          <caption className="vh">How Verisavo differs from general AI tools</caption>
          <thead><tr><th scope="col"><span className="vh">Question</span></th><th scope="col">General AI tools</th><th scope="col" className="cmp-v">Verisavo</th></tr></thead>
          <tbody>
            <tr><th scope="row">Where do answers come from?</th><td>Training data and available sources</td><td className="cmp-v">Company data, public records, digital platforms and verified intelligence from the ground</td></tr>
            <tr><th scope="row">Can you verify the answer?</th><td>Sources and reasoning may be limited</td><td className="cmp-v">Evidence linked to its source, location, date and reliability</td></tr>
            <tr><th scope="row">What if evidence is missing?</th><td>May generate uncertain answers</td><td className="cmp-v">States what is unknown and identifies Intelligence Gaps</td></tr>
            <tr><th scope="row">What about offline markets?</th><td>Limited by available digital information</td><td className="cmp-v">SavoScouts gather intelligence on the ground, verified before it is used</td></tr>
            <tr><th scope="row">Does understanding improve?</th><td>Depends on the tool and its memory</td><td className="cmp-v">Market Memory tracks changes and builds understanding over time</td></tr>
          </tbody>
        </table>
      </div>
        </div>
      </section>
      {" "}

      {" "}
      <section className="sec" id="trust" aria-labelledby="trust-title">
        {" "}
        <div className="wrap">
          {" "}
          <div className="trust-head">
            {" "}
            <h2 id="trust-title">{"Built on trust"}</h2>
            {" "}
            <p className="lead">{"Know what the evidence supports, where it falls short, and what remains in your control."}</p>
            <a className="doclink" href="/docs.html#privacy">Read about privacy and responsible use <span aria-hidden="true">→</span></a>
            {" "}
          </div>
          {" "}
          <div className="tgrid-wrap">
            <div className="tgrid">
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <rect x="5" y="10" width="12" height="8" rx="2" stroke="#4362B2" strokeWidth="1.7" fill="none"></rect>
                    <path d="M8 10V7.5a3 3 0 0 1 6 0V10" stroke="#4362B2" strokeWidth="1.7" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Private by default"}</h3>
                <p>{"Your company data stays private, secure, and fully under your control."}</p>
              </article>
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <path d="M5 6h12M5 11h12M5 16h7" stroke="#4362B2" strokeWidth="1.7" strokeLinecap="round" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Traceable evidence"}</h3>
                <p>{"Every insight is linked to its source, location, timing, and confidence level."}</p>
              </article>
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <circle cx="11" cy="11" r="7.5" stroke="#4362B2" strokeWidth="1.7" strokeDasharray="3 3" fill="none"></circle>
                    <path d="M9 9a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6 1v.6M11 15v.1" stroke="#4362B2" strokeWidth="1.6" strokeLinecap="round" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Unknowns made clear"}</h3>
                <p>{"When evidence is incomplete, we clearly show what is unknown and what to explore next."}</p>
              </article>
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <circle cx="11" cy="7.5" r="3.2" stroke="#4362B2" strokeWidth="1.7" fill="none"></circle>
                    <path d="M4.5 18c.9-3.2 3.4-4.8 6.5-4.8s5.6 1.6 6.5 4.8" stroke="#4362B2" strokeWidth="1.7" strokeLinecap="round" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Human decisions"}</h3>
                <p>{"Verisavo provides clarity and context. The final decision always remains with your team."}</p>
              </article>
            </div>
          </div>
          {" "}
        </div>
        {" "}
      </section>
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
