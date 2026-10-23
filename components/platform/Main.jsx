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
<section className="sec sample" id="sample" aria-labelledby="sample-title">
  <div className="wrap">
    <p className="src-strip"><span className="src-k">Built from</span><span className="src-v">Company data</span><span className="src-v">Public records</span><span className="src-v">Digital platforms</span><span className="src-v">Market research</span><span className="src-v">SavoScouts</span></p>
    <div className="sample-grid">
      <div className="sample-intro">
        <p className="eyebrow">What an answer looks like</p>
        <h2 id="sample-title">Every claim shows how much we know.</h2>
        <p className="lead">Verisavo separates what the evidence establishes from what it only suggests, and from what it cannot yet answer. You see the sources behind each claim and the gap that matters most.</p>
        <a className="doclink" href="/docs.html#intelligence-states">How Verisavo labels certainty <span aria-hidden="true">→</span></a>
      </div>
      <article className="ans" aria-label="Example answer">
        <div className="ans-q"><span className="ans-k">Question</span><p>Why are enquiries rising in Lugbe while sales fall?</p></div>
        <ul className="ans-list">
          <li><span className="st st-fact">Fact</span><div><p>Enquiries from Lugbe rose over the last eight weeks while completed sales fell.</p><small>Company data · sales records, Abuja team</small></div></li>
          <li><span className="st st-inf">Inference</span><div><p>Two competitors cut prices on similar products in the same period, so buyers may be comparing before they commit.</p><small>Digital platforms · online price listings</small></div></li>
          <li><span className="st st-unk">Unknown</span><div><p>Whether the product was in stock at the Lugbe retailers buyers were sent to.</p><small>No evidence yet</small></div></li>
        </ul>
        <div className="ans-gap"><span className="ans-k">Intelligence Gap</span><p>Check shelf availability at the main Lugbe retailers. This is the question most likely to change the answer.</p></div>
      </article>
    </div>
    <p className="sample-note">Example for illustration. The place, figures and sources are not real customer data.</p>
  </div>
</section>
      {" "}
      <section className="sec how" id="how" aria-labelledby="how-title">
        <div className="wrap how-grid">
          <div className="how-intro">
            <p className="eyebrow">How it works</p>
            <h2 id="how-title">From scattered signals to a clear answer.</h2>
            <p className="how-sub">Five steps turn fragmented market information into intelligence you can check, question and act on.</p>
            <a className="doclink" href="/docs.html#how-it-works">Read how it works in the Docs <span aria-hidden="true">→</span></a>
          </div>
          <ol className="how-list"><li><h3>Capture</h3><p>We gather signals from your company data, public records, digital platforms and market research, and from SavoScouts on the ground when the evidence runs out.</p></li><li><h3>Verify</h3><p>We check each piece of evidence for source, place, time and reliability, compare it across sources and flag contradictions instead of hiding them.</p></li><li><h3>Connect</h3><p>We link evidence across businesses, products, prices, places, channels and time, so the relationships behind a change become visible.</p></li><li><h3>Remember</h3><p>We keep a Market Memory of what changed, when it changed and which evidence changed it, so understanding builds over time.</p></li><li><h3>Answer</h3><p>We answer your question with the evidence attached, label what is known and what is not, and name the Intelligence Gaps that could change your decision.</p></li></ol>
        </div>
      </section>
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
            <tr><th scope="row">Where answers come from</th><td>Training data and the open web</td><td className="cmp-v">Your company data, public records, digital platforms and Ground-Level Intelligence, connected</td></tr>
            <tr><th scope="row">Can you check the source?</th><td>Often not</td><td className="cmp-v">Each claim links to its source, place and date</td></tr>
            <tr><th scope="row">When evidence is thin</th><td>Usually answers anyway</td><td className="cmp-v">Says Unknown and names the Intelligence Gap</td></tr>
            <tr><th scope="row">Places with little online</th><td>Little to go on</td><td className="cmp-v">Can be checked on the ground by SavoScouts</td></tr>
          </tbody>
        </table>
      </div>
        </div>
      </section>
      {" "}
<section className="sec uses" id="uses" aria-labelledby="uses-title">
  <div className="wrap">
    <div className="sec-head">
      <p className="eyebrow">Use cases</p>
      <h2 id="uses-title">Questions teams bring to Verisavo.</h2>
    </div>
    <div className="uc-grid">
      <a className="uc" href="/docs.html#asking-questions"><h3>Where to launch first</h3><p>Compare cities and neighbourhoods on demand, competition and reach.</p><span className="uc-go" aria-hidden="true">→</span></a>
      <a className="uc" href="/docs.html#asking-questions"><h3>Why sales changed</h3><p>Trace a shift in sales to prices, supply, competitors or customers.</p><span className="uc-go" aria-hidden="true">→</span></a>
      <a className="uc" href="/docs.html#signals"><h3>Who you compete with</h3><p>See who sells nearby, at what price and through which channels.</p><span className="uc-go" aria-hidden="true">→</span></a>
      <a className="uc" href="/docs.html#savoscouts"><h3>How far distribution reaches</h3><p>Find where your product is on shelves and where it runs out.</p><span className="uc-go" aria-hidden="true">→</span></a>
      <a className="uc" href="/docs.html#evidence"><h3>How to price</h3><p>Compare your prices with what people pay, place by place.</p><span className="uc-go" aria-hidden="true">→</span></a>
      <a className="uc" href="/docs.html#market-memory"><h3>How customers are changing</h3><p>Notice shifts in what people buy, where and why.</p><span className="uc-go" aria-hidden="true">→</span></a>
    </div>
  </div>
</section>
      {" "}
      <section className="sec" id="trust" aria-labelledby="trust-title">
        {" "}
        <div className="wrap">
          {" "}
          <div className="trust-head">
            {" "}
            <h2 id="trust-title">{"Built on Trust"}</h2>
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
                <h3>{"Private by Default"}</h3>
                <p>{"Your company data stays private, secure, and fully under your control."}</p>
              </article>
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <path d="M5 6h12M5 11h12M5 16h7" stroke="#4362B2" strokeWidth="1.7" strokeLinecap="round" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Traceable Evidence"}</h3>
                <p>{"Every insight is linked to its source, location, timing, and confidence level."}</p>
              </article>
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <circle cx="11" cy="11" r="7.5" stroke="#4362B2" strokeWidth="1.7" strokeDasharray="3 3" fill="none"></circle>
                    <path d="M9 9a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6 1v.6M11 15v.1" stroke="#4362B2" strokeWidth="1.6" strokeLinecap="round" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Unknowns Made Clear"}</h3>
                <p>{"When evidence is incomplete, we clearly show what is unknown and what to explore next."}</p>
              </article>
              <article className="tc">
                <span className="tc-ic">
                  <svg viewBox="0 0 22 22" aria-hidden="true">
                    <circle cx="11" cy="7.5" r="3.2" stroke="#4362B2" strokeWidth="1.7" fill="none"></circle>
                    <path d="M4.5 18c.9-3.2 3.4-4.8 6.5-4.8s5.6 1.6 6.5 4.8" stroke="#4362B2" strokeWidth="1.7" strokeLinecap="round" fill="none"></path>
                  </svg>
                </span>
                <h3>{"Human Decisions"}</h3>
                <p>{"Verisavo provides clarity and context. The final decision always remains with your team."}</p>
              </article>
            </div>
          </div>
          {" "}
        </div>
        {" "}
      </section>
      {" "}
      <section className="sec faq-sec" id="faq" aria-labelledby="faq-title">
        {" "}
        <div className="wrap faq">
          {" "}
          <div className="faq-intro">
            {" "}
            <p className="eyebrow">{"FAQs"}</p>
            {" "}
            <h2 id="faq-title">{"Clear answers."}<br /><span className="tone2">{"Grounded in evidence."}</span></h2>
            {" "}
            <p className="faq-talk">
              {"Need help with a specific market decision? "}
              <button type="button" className="linkbtn" data-access="">{"Talk to our team."}</button>
            </p>
            <p className="faq-talk">More answers in the <a className="doclink" href="/docs.html#faq">Docs <span aria-hidden="true">→</span></a></p>
            {" "}
          </div>
          {" "}
          <div className="qa">
            {" "}
            <details open>
              <summary>
                {"What is Verisavo?"}
                <span aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="#1F273F" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                </span>
              </summary>
              {" "}
              <p>
                {"Verisavo is the connected intelligence layer for African markets, combining market intelligence, business context, and verified ground-level evidence to support better decisions."}
              </p>
            </details>
            {" "}
            <details>
              <summary>
                {"Where does the intelligence come from?"}
                <span aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="#1F273F" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                </span>
              </summary>
              {" "}
              <p>
                {"From public sources, your company’s data, and Ground-Level Intelligence collected by SavoScouts where other sources fall short."}
              </p>
            </details>
            {" "}
            <details>
              <summary>
                {"What are SavoScouts?"}
                <span aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="#1F273F" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                </span>
              </summary>
              {" "}
              <p>
                {"SavoScouts are Verisavo’s network of local contributors. They capture verified, on-the-ground evidence where other sources fall short."}
              </p>
            </details>
            {" "}
            <details>
              <summary>
                {"What if the answer isn’t available?"}
                <span aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="#1F273F" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                </span>
              </summary>
              {" "}
              <p>
                {"We make that clear. Verisavo shows what’s missing, what’s unknown, and where further evidence is needed."}
              </p>
            </details>
            {" "}
            <details>
              <summary>
                {"Is my company information private?"}
                <span aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="#1F273F" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                </span>
              </summary>
              {" "}
              <p>
                {"Yes. Your data remains private, secure, and under your control. It is never shared with other customers."}
              </p>
            </details>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </section>
      {" "}
<section className="sec status" id="status" aria-labelledby="status-title">
  <div className="wrap">
    <div className="sec-head">
      <p className="eyebrow">Where we are</p>
      <h2 id="status-title">What is available now.</h2>
      <p className="lead">We would rather be clear about what works today than overpromise.</p>
    </div>
    <div className="stat-grid">
      <div className="stat"><span className="chip-s s-on">Available</span><ul><li>Ask market questions</li><li>Answers with sources</li><li>Fact, Inference and Unknown labels</li><li>Intelligence Gaps</li></ul></div>
      <div className="stat"><span className="chip-s s-dev">In development</span><ul><li>SavoScouts investigations</li><li>Market Memory</li></ul></div>
      <div className="stat"><span className="chip-s s-plan">Planned</span><ul><li>Market Simulation</li></ul></div>
    </div>
    <p className="price-line">Start free with 5 questions. Verisavo Monthly is $6.99 a month. <button type="button" className="linkbtn" data-href="/#pricing">See pricing</button></p>
  </div>
</section>
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
