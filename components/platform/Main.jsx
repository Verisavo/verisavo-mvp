import { AX_GALLERY, AX_WORKS } from "./axMarkup";
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
            <a className="btn btn-rect plain" href="/contact">{"Contact us"}</a>
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
              <form className="chat" id="ask-form" noValidate>
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
                      <ul className="place-menu" id="place-menu" role="menu" aria-label="Choose a market" hidden><li className="mk-s" role="presentation"><input type="search" className="mk-q" placeholder="Search 54 countries" aria-label="Search countries" autoComplete="off" /></li><li><button type="button" role="menuitemradio" aria-checked="true" data-place="All markets">All markets</button></li><li className="mk-h" role="presentation">North Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Algeria" data-k="algeria">Algeria</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Egypt" data-k="egypt">Egypt</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Libya" data-k="libya">Libya</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Morocco" data-k="morocco">Morocco</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Sudan" data-k="sudan">Sudan</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Tunisia" data-k="tunisia">Tunisia</button></li><li className="mk-h" role="presentation">West Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Benin" data-k="benin">Benin</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Burkina Faso" data-k="burkina faso">Burkina Faso</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Cabo Verde" data-k="cabo verde cape verde">Cabo Verde</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Côte d’Ivoire" data-k="côte d’ivoire ivory coast cote divoire">Côte d’Ivoire</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="The Gambia" data-k="the gambia gambia">The Gambia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Ghana" data-k="ghana">Ghana</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Guinea" data-k="guinea">Guinea</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Guinea-Bissau" data-k="guinea-bissau">Guinea-Bissau</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Liberia" data-k="liberia">Liberia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Mali" data-k="mali">Mali</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Mauritania" data-k="mauritania">Mauritania</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Niger" data-k="niger">Niger</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Nigeria" data-k="nigeria">Nigeria</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Senegal" data-k="senegal">Senegal</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Sierra Leone" data-k="sierra leone">Sierra Leone</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Togo" data-k="togo">Togo</button></li><li className="mk-h" role="presentation">Central Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Cameroon" data-k="cameroon">Cameroon</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Central African Republic" data-k="central african republic car">Central African Republic</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Chad" data-k="chad">Chad</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Republic of the Congo" data-k="republic of the congo congo brazzaville">Republic of the Congo</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="DR Congo" data-k="dr congo drc democratic republic congo kinshasa">DR Congo</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Equatorial Guinea" data-k="equatorial guinea">Equatorial Guinea</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Gabon" data-k="gabon">Gabon</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="São Tomé and Príncipe" data-k="são tomé and príncipe sao tome principe">São Tomé and Príncipe</button></li><li className="mk-h" role="presentation">East Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Burundi" data-k="burundi">Burundi</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Comoros" data-k="comoros">Comoros</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Djibouti" data-k="djibouti">Djibouti</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Eritrea" data-k="eritrea">Eritrea</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Ethiopia" data-k="ethiopia">Ethiopia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Kenya" data-k="kenya">Kenya</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Madagascar" data-k="madagascar">Madagascar</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Mauritius" data-k="mauritius">Mauritius</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Rwanda" data-k="rwanda">Rwanda</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Seychelles" data-k="seychelles">Seychelles</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Somalia" data-k="somalia">Somalia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="South Sudan" data-k="south sudan">South Sudan</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Tanzania" data-k="tanzania">Tanzania</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Uganda" data-k="uganda">Uganda</button></li><li className="mk-h" role="presentation">Southern Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Angola" data-k="angola">Angola</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Botswana" data-k="botswana">Botswana</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Eswatini" data-k="eswatini swaziland">Eswatini</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Lesotho" data-k="lesotho">Lesotho</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Malawi" data-k="malawi">Malawi</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Mozambique" data-k="mozambique">Mozambique</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Namibia" data-k="namibia">Namibia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="South Africa" data-k="south africa">South Africa</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Zambia" data-k="zambia">Zambia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-place="Zimbabwe" data-k="zimbabwe">Zimbabwe</button></li><li className="mk-none" role="presentation" hidden>No country matches</li></ul>
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
                {"Answers are designed to show the evidence behind them, how confident they are, and what is still unknown."}
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
      {" "}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: AX_GALLERY }} />
      <section className="band" id="platform" aria-labelledby="platform-title">
        {" "}
        <div className="wrap">
          {" "}
          <div className="band-head">
            {" "}
            <h2 id="platform-title">{"Beyond the Answer"}</h2>
            {" "}
            <p>
              {"General-purpose AI helps you find answers. Verisavo goes further, connecting market information, company knowledge and verified intelligence from the ground to build a clearer understanding of African markets."}
            </p>
            {" "}
          </div>
          {" "}
          <div className="vs" role="table" aria-label="How Verisavo differs from general-purpose AI"><div className="vs-row vs-headrow" role="row"><div role="columnheader"><span className="vh">Question</span></div><div className="vs-hg" role="columnheader">General-purpose AI</div><div className="vs-hv" role="columnheader">Verisavo</div></div><div className="vs-row" role="row"><div className="vs-q" role="rowheader"><span className="vs-n">01</span>Where do answers come from?</div><div className="vs-g" role="cell"><span className="vs-lab">General-purpose AI</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><p>Training data, available information and connected sources.</p></div><div className="vs-v" role="cell"><span className="vs-lab">Verisavo</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><p>Connects company data, public records, research, digital platforms and Ground-Level Intelligence.</p></div></div><div className="vs-row" role="row"><div className="vs-q" role="rowheader"><span className="vs-n">02</span>Can you trace the evidence?</div><div className="vs-g" role="cell"><span className="vs-lab">General-purpose AI</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><p>Source visibility and verification vary by tool.</p></div><div className="vs-v" role="cell"><span className="vs-lab">Verisavo</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><p>Links findings to supporting evidence, including source, location, date and reliability.</p></div></div><div className="vs-row" role="row"><div className="vs-q" role="rowheader"><span className="vs-n">03</span>What happens when evidence is missing?</div><div className="vs-g" role="cell"><span className="vs-lab">General-purpose AI</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><p>May provide answers despite incomplete information.</p></div><div className="vs-v" role="cell"><span className="vs-lab">Verisavo</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><p>Identifies what is unknown, names the Intelligence Gap and recommends what to check next.</p></div></div><div className="vs-row" role="row"><div className="vs-q" role="rowheader"><span className="vs-n">04</span>What about markets with limited online information?</div><div className="vs-g" role="cell"><span className="vs-lab">General-purpose AI</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><p>Depends largely on accessible information.</p></div><div className="vs-v" role="cell"><span className="vs-lab">Verisavo</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><p>SavoScouts can gather and verify evidence directly from local markets and communities.</p></div></div><div className="vs-row" role="row"><div className="vs-q" role="rowheader"><span className="vs-n">05</span>Does understanding improve over time?</div><div className="vs-g" role="cell"><span className="vs-lab">General-purpose AI</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h7"/></svg><p>Depends on memory, connected data and available context.</p></div><div className="vs-v" role="cell"><span className="vs-lab">Verisavo</span><svg className="vs-i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6"/></svg><p>Market Memory preserves findings, tracks changes and updates understanding as new evidence emerges.</p></div></div></div><p className="vs-src">Comparison describes general capabilities; individual AI tools vary. Verisavo capabilities are presented as designed, including features under development.</p>
        </div>
      </section>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: AX_WORKS }} />
      {" "}

      {" "}
      {" "}
      
      {" "}

      {" "}
    </main>
  );
}
