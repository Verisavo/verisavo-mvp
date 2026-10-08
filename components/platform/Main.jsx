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
            <button type="button" className="btn btn-rect plain" data-scroll="how">{"See how it works"}</button>
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
      <section className="sec how" id="how" aria-labelledby="how-title">
        {" "}
        <div className="wrap">
          {" "}
          <p className="eyebrow">{"How it works"}</p>
          {" "}
          <h2 id="how-title">{"Start with the decision."}</h2>
          {" "}
          <p className="how-sub">{"One question. The evidence that matters. A clearer next step."}</p>
          {" "}
          <ol className="how-steps">
            {" "}
            <li>
              <span className="hn">{"01"}</span>
              <h3>{"Ask"}</h3>
              <p>{"Start with a market question. Add your goals and relevant business context."}</p>
            </li>
            {" "}
            <li>
              <span className="hn">{"02"}</span>
              <h3>{"Connect"}</h3>
              <p>{"Bring together existing intelligence, signals, and supporting evidence."}</p>
            </li>
            {" "}
            <li>
              <span className="hn">{"03"}</span>
              <h3>{"Investigate"}</h3>
              <p>{"Identify gaps, validate assumptions, and gather evidence where it matters."}</p>
            </li>
            {" "}
            <li>
              <span className="hn">{"04"}</span>
              <h3>{"Decide"}</h3>
              <p>{"Compare findings, assess uncertainty, and choose your next move."}</p>
            </li>
            {" "}
          </ol>
          {" "}
        </div>
        {" "}
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
          <div className="apbox">
            {" "}
            <div className="ap-head"><p className="eyebrow">{"What makes Verisavo different"}</p></div>
            {" "}
            <div className="ap-grid2">
              {" "}
              <div className="ap-side">
                {" "}
                <p className="ap-group">{"Approaches"}</p>
                {" "}
                <div className="ap-list" role="tablist" aria-label="Approaches" aria-orientation="vertical">
                  <button role="tab" id="ap0" aria-controls="apchart" aria-selected="true" data-ap="0">{"Market reports"}</button>
                  <button role="tab" id="ap1" aria-controls="apchart" aria-selected="false" tabIndex="-1" data-ap="1">{"Research agencies"}</button>
                  <button role="tab" id="ap2" aria-controls="apchart" aria-selected="false" tabIndex="-1" data-ap="2">{"Data providers"}</button>
                  <button role="tab" id="ap3" aria-controls="apchart" aria-selected="false" tabIndex="-1" data-ap="3">{"General AI tools"}</button>
                </div>
                {" "}
              </div>
              {" "}
              <div className="ap-panel">
                {" "}
                <div className="ap-legend">
                  <span className="lg lg-v"><i></i>{"Verisavo"}</span>
                  <span className="lg lg-s"><i></i>{"Competitors"}</span>
                  <span className="ap-illus ap-try">{"Hover an approach or dot to compare"}</span>
                </div>
                {" "}
                <p className="ap-cap ap-cap-y" aria-hidden="true">{"↑ Updated as evidence arrives"}</p>
                {" "}
                <svg className="apchart" id="apchart" data-layouts="[[[164, 235], [278, 273], [372, 176], [455, 219], [538, 62]], [[205, 203], [242, 257], [392, 143], [434, 251], [517, 52]], [[143, 219], [299, 246], [340, 165], [486, 208], [548, 73]], [[184, 181], [257, 278], [320, 133], [403, 224], [528, 68]]]" viewBox="0 0 620 350" role="img" aria-label="Illustrative positioning: Verisavo is the most connected across sources and the most updated as evidence arrives">
                  {" "}
                  <g className="ap-grid">
                    <line x1="70" x2="590" y1="300" y2="300"></line>
                    <line x1="70" x2="590" y1="232" y2="232"></line>
                    <line x1="70" x2="590" y1="165" y2="165"></line>
                    <line x1="70" x2="590" y1="98" y2="98"></line>
                    <line x1="70" x2="590" y1="30" y2="30"></line>
                  </g>
                  {" "}
                  <line className="ap-axis" x1="70" y1="300" x2="590" y2="300"></line>
                  <line className="ap-axis" x1="70" y1="30" x2="70" y2="300"></line>
                  {" "}
                  <text className="ap-tick" x="60" y="34" textAnchor="end">{"High"}</text>
                  {" "}
                  <text className="ap-tick" x="62" y="316" textAnchor="end">{"Low"}</text>
                  <text className="ap-tick" x="590" y="322" textAnchor="end">{"High"}</text>
                  {" "}
                  <text className="ap-lab" x="330" y="342" textAnchor="middle">{"CONNECTED ACROSS SOURCES"}</text>
                  {" "}
                  <text className="ap-lab" transform="translate(18 165) rotate(-90)" textAnchor="middle">{"UPDATED AS EVIDENCE ARRIVES"}</text>
                  {" "}
                  <g className="apt" data-i="0" tabIndex="0" role="button" aria-label="Market reports: where it falls short" style={{ transform: "translate(164px, 241px)" }}><circle r="7"></circle></g>
                  <g className="apt" data-i="1" tabIndex="0" role="button" aria-label="Research agencies: where it falls short" style={{ transform: "translate(247px, 262px)" }}><circle r="7"></circle></g>
                  <g className="apt" data-i="2" tabIndex="0" role="button" aria-label="Data providers: where it falls short" style={{ transform: "translate(340px, 170px)" }}><circle r="7"></circle></g>
                  <g className="apt" data-i="3" tabIndex="0" role="button" aria-label="General AI tools: where it falls short" style={{ transform: "translate(413px, 230px)" }}><circle r="7"></circle></g>
                  {" "}
                  <g className="apv" tabIndex="0" role="button" aria-label="Verisavo: what makes it different" style={{ transform: "translate(538px, 62px)" }}><circle r="9"></circle></g>
                  {" "}
                </svg>
                {" "}
                <p className="ap-cap ap-cap-x" aria-hidden="true">{"Connected across sources →"}</p>
                {" "}
                <p className="ap-hint" aria-hidden="true">{"Tap an approach or a dot to compare"}</p>
                <div className="ap-tip" id="ap-tip" role="status" aria-live="polite" hidden></div>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
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
              <button type="button" className="btn btn-outline-w" data-href="/">{"Explore Verisavo"}</button>
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
