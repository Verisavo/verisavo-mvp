// Converted from the original static page. Markup only: behaviour lives in lib/platform/.
export default function AssistantWindow() {
  return (
    <dialog id="va" className="va" aria-label="Verisavo Intelligence Assistant">
      {" "}
      <div className="va-app">
        {" "}
        <aside className="va-side" id="va-side" aria-label="Assistant navigation">
          {" "}
          <div className="va-brand">
            {" "}
            <span className="va-word">{"Verisavo"}</span>
            {" "}
            <button type="button" className="va-ib va-side-x" id="va-side-x" aria-label="Hide sidebar">
              <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2.5"></rect><path d="M8 4v12"></path></svg>
            </button>
            {" "}
          </div>
          {" "}
          <button type="button" className="va-new" id="va-new">
            <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12"></path></svg>
            <span>{"New question"}</span>
          </button>
          {" "}
          <ul className="va-list">
            {" "}
            <li>
              <button type="button" className="va-nav" id="va-search-btn" aria-expanded="false" aria-controls="va-search">
                <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.2"></circle><path d="M13 13l3.5 3.5"></path></svg>
                <span>{"Search"}</span>
              </button>
            </li>
            {" "}
            <li>
              <button type="button" className="va-nav" id="va-scouts">
                <svg className="vi" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 17s-5-4.6-5-8.4a5 5 0 0 1 10 0C15 12.4 10 17 10 17z"></path>
                  <circle cx="10" cy="8.6" r="1.8"></circle>
                </svg>
                <span>{"SavoScouts"}</span>
              </button>
            </li>
            {" "}
          </ul>
          {" "}
          <div className="va-search" id="va-search" hidden>
            <input id="va-search-in" type="search" placeholder="Search your questions" aria-label="Search your questions" autoComplete="off" />
          </div>
          {" "}
          <p className="va-h va-h-recent">{"Recent"}</p>
          {" "}
          <ul className="va-list va-recent" id="va-recent"></ul>
          {" "}
          <p className="va-empty" id="va-recent-empty">{"Questions you ask appear here."}</p>
          {" "}
          <div className="va-user">
            {" "}
            <span className="va-av" id="va-av">{"V"}</span>
            {" "}
            <span className="va-who"><b id="va-name">{"You"}</b><small>{"Early access"}</small></span>
            {" "}
            <div className="va-pop-wrap">
              {" "}
              <button type="button" className="va-ib" id="va-gear" aria-haspopup="menu" aria-expanded="false" aria-controls="va-gear-menu" aria-label="Account settings" title="Account settings">
                <svg className="vi" viewBox="0 0 24 24" aria-hidden="true" style={{ strokeWidth: "1.7" }}>
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              {" "}
              <div className="va-pop va-pop-up" id="va-gear-menu" role="menu" hidden>
                {" "}
                <button type="button" role="menuitem" data-legal="privacy">{"Privacy Policy"}</button>
                {" "}
                <button type="button" role="menuitem" data-legal="terms">{"Terms of Service"}</button>
                {" "}
                <button type="button" role="menuitem" id="va-signout">{"Sign out"}</button>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </aside>
        {" "}
        <div className="va-scrim" id="va-scrim" hidden></div>
        {" "}
        <section className="va-main">
          {" "}
          <header className="va-top">
            {" "}
            <button type="button" className="va-ib va-open-side" id="va-open-side" aria-label="Show sidebar" aria-controls="va-side" aria-expanded="false">
              <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M4 10h12M4 14h12"></path></svg>
            </button>
            {" "}
            <div className="va-pop-wrap">
              {" "}
              <button type="button" className="va-scope" id="va-scope" aria-haspopup="menu" aria-expanded="false" aria-controls="va-scope-menu">
                <span id="va-scope-label">{"All markets"}</span>
                <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8l4 4 4-4"></path></svg>
              </button>
              {" "}
              <ul className="va-pop" id="va-scope-menu" role="menu" aria-label="Market scope" hidden><li className="mk-s" role="presentation"><input type="search" className="mk-q" placeholder="Search 54 countries" aria-label="Search countries" autoComplete="off" /></li><li><button type="button" role="menuitemradio" aria-checked="true" data-market="All markets">All markets</button></li><li className="mk-h" role="presentation">North Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Algeria" data-k="algeria">Algeria</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Egypt" data-k="egypt">Egypt</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Libya" data-k="libya">Libya</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Morocco" data-k="morocco">Morocco</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Sudan" data-k="sudan">Sudan</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Tunisia" data-k="tunisia">Tunisia</button></li><li className="mk-h" role="presentation">West Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Benin" data-k="benin">Benin</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Burkina Faso" data-k="burkina faso">Burkina Faso</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Cabo Verde" data-k="cabo verde cape verde">Cabo Verde</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Côte d’Ivoire" data-k="côte d’ivoire ivory coast cote divoire">Côte d’Ivoire</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="The Gambia" data-k="the gambia gambia">The Gambia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Ghana" data-k="ghana">Ghana</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Guinea" data-k="guinea">Guinea</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Guinea-Bissau" data-k="guinea-bissau">Guinea-Bissau</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Liberia" data-k="liberia">Liberia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Mali" data-k="mali">Mali</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Mauritania" data-k="mauritania">Mauritania</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Niger" data-k="niger">Niger</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Nigeria" data-k="nigeria">Nigeria</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Senegal" data-k="senegal">Senegal</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Sierra Leone" data-k="sierra leone">Sierra Leone</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Togo" data-k="togo">Togo</button></li><li className="mk-h" role="presentation">Central Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Cameroon" data-k="cameroon">Cameroon</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Central African Republic" data-k="central african republic car">Central African Republic</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Chad" data-k="chad">Chad</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Republic of the Congo" data-k="republic of the congo congo brazzaville">Republic of the Congo</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="DR Congo" data-k="dr congo drc democratic republic congo kinshasa">DR Congo</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Equatorial Guinea" data-k="equatorial guinea">Equatorial Guinea</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Gabon" data-k="gabon">Gabon</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="São Tomé and Príncipe" data-k="são tomé and príncipe sao tome principe">São Tomé and Príncipe</button></li><li className="mk-h" role="presentation">East Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Burundi" data-k="burundi">Burundi</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Comoros" data-k="comoros">Comoros</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Djibouti" data-k="djibouti">Djibouti</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Eritrea" data-k="eritrea">Eritrea</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Ethiopia" data-k="ethiopia">Ethiopia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Kenya" data-k="kenya">Kenya</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Madagascar" data-k="madagascar">Madagascar</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Mauritius" data-k="mauritius">Mauritius</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Rwanda" data-k="rwanda">Rwanda</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Seychelles" data-k="seychelles">Seychelles</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Somalia" data-k="somalia">Somalia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="South Sudan" data-k="south sudan">South Sudan</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Tanzania" data-k="tanzania">Tanzania</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Uganda" data-k="uganda">Uganda</button></li><li className="mk-h" role="presentation">Southern Africa</li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Angola" data-k="angola">Angola</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Botswana" data-k="botswana">Botswana</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Eswatini" data-k="eswatini swaziland">Eswatini</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Lesotho" data-k="lesotho">Lesotho</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Malawi" data-k="malawi">Malawi</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Mozambique" data-k="mozambique">Mozambique</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Namibia" data-k="namibia">Namibia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="South Africa" data-k="south africa">South Africa</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Zambia" data-k="zambia">Zambia</button></li><li><button type="button" role="menuitemradio" aria-checked="false" data-market="Zimbabwe" data-k="zimbabwe">Zimbabwe</button></li><li className="mk-none" role="presentation" hidden>No country matches</li></ul>
              {" "}
            </div>
            {" "}
            <div className="va-top-r">
              {" "}
              <button type="button" className="va-ib va-theme" id="va-theme" aria-pressed="false" aria-label="Switch to dark theme" title="Switch to dark theme">
                <svg className="vi va-sun" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="3.2"></circle>
                  <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3L6 14M14 6l1.3-1.3"></path>
                </svg>
                <svg className="vi va-moon" viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 12.3A6 6 0 0 1 7.7 4.5a6 6 0 1 0 7.8 7.8z"></path></svg>
              </button>
              {" "}
              <div className="va-pop-wrap">
                {" "}
                <button type="button" className="va-ib va-shield" id="va-shield" aria-expanded="false" aria-controls="va-shield-tip" aria-label="Privacy">
                  <svg className="vi" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 3l5.5 2v4.6c0 3.4-2.3 5.9-5.5 7.4-3.2-1.5-5.5-4-5.5-7.4V5z"></path>
                    <path d="M7.6 10.1l1.7 1.7 3.2-3.4"></path>
                  </svg>
                </button>
                {" "}
                <div className="va-pop va-tip" id="va-shield-tip" hidden>
                  <b>{"Private by default"}</b>
                  {"Your company data stays private, secure and under your control. It is never shared with other customers."}
                </div>
                {" "}
              </div>
              {" "}
              <button type="button" className="va-ib" id="va-new2" aria-label="New question">
                <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16h3l8.2-8.2a1.8 1.8 0 0 0-3-3L4 13z"></path><path d="M11 6l3 3"></path></svg>
              </button>
              {" "}
              <div className="va-pop-wrap">
                {" "}
                <button type="button" className="va-ib" id="va-more" aria-haspopup="menu" aria-expanded="false" aria-controls="va-more-menu" aria-label="More options">
                  <svg className="vi" viewBox="0 0 20 20" aria-hidden="true">
                    <circle cx="5" cy="10" r="1.1"></circle>
                    <circle cx="10" cy="10" r="1.1"></circle>
                    <circle cx="15" cy="10" r="1.1"></circle>
                  </svg>
                </button>
                {" "}
                <div className="va-pop va-pop-r" id="va-more-menu" role="menu" hidden>
                  {" "}
                  <button type="button" role="menuitem" id="va-clear">{"Clear this conversation"}</button>
                  {" "}
                  <button type="button" role="menuitem" id="va-clear-all">{"Clear all recent questions"}</button>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              <button type="button" className="va-ib" id="va-x" aria-label="Close assistant">
                <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"></path></svg>
              </button>
              {" "}
            </div>
            {" "}
          </header>
          {" "}
          <div className="va-body" id="va-body">
            {" "}
            <div className="va-hello" id="va-hello">{" "}<p className="va-hi">{"Verisavo Intelligence Assistant"}</p><h2 id="va-greet">{"What do you need to understand?"}</h2><p className="va-sub">{"Ask about a market, a competitor or a decision. Answers are designed to show their evidence, and what is still unknown."}</p></div>
            {" "}
            <ol className="va-thread" id="va-thread" aria-live="polite"></ol>
            {" "}
          </div>
          {" "}
          <div className="va-dock" id="va-dock">
            {" "}
            <form className="va-composer" id="va-form" noValidate>
              {" "}
              <ul className="va-files" id="va-files" hidden></ul>
              {" "}
              <div className="va-row">
                {" "}
                <button type="button" className="va-ib va-add" id="va-add" aria-label="Add images or files"><svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12"></path></svg></button>
                {" "}
                <input type="file" id="va-file" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,image/*" />
                {" "}
                <label className="vh" htmlFor="va-in">{"Message Verisavo"}</label>
                {" "}
                <textarea id="va-in" rows="1" maxLength="1000" placeholder="Ask about a market or a decision" />
                {" "}
                <button type="submit" className="va-send" id="va-send" aria-label="Send question" disabled>
                  <svg className="vi" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15.5V5M5.5 9.5L10 5l4.5 4.5"></path></svg>
                </button>
                {" "}
              </div>
              {" "}
            </form>
            {" "}
            <div className="va-chips" id="va-chips">
              <button type="button" className="va-chip va-sugg" data-q="What does the market for our product look like?"><span className="va-sugg-ic"><svg className="vi" viewBox="0 0 20 20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: "<circle cx=\"10\" cy=\"10\" r=\"6.5\"></circle><path d=\"M3.5 10h13M10 3.5c2 2 2.8 4.2 2.8 6.5S12 14.5 10 16.5M10 3.5C8 5.5 7.2 7.7 7.2 10s.8 4.5 2.8 6.5\"></path>" }}></svg></span><b>{"Explore a market"}</b><small>{"See who sells what, where and at what price"}</small></button>
              <button type="button" className="va-chip va-sugg" data-q="Where should we launch first, and why?"><span className="va-sugg-ic"><svg className="vi" viewBox="0 0 20 20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: "<path d=\"M10 17s-5-4.6-5-8.4a5 5 0 0 1 10 0C15 12.4 10 17 10 17z\"></path><circle cx=\"10\" cy=\"8.6\" r=\"1.8\"></circle>" }}></svg></span><b>{"Compare locations"}</b><small>{"Weigh cities or districts for your next move"}</small></button>
              <button type="button" className="va-chip va-sugg" data-q="What don’t we know yet that could change our plan?"><span className="va-sugg-ic"><svg className="vi" viewBox="0 0 20 20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: "<circle cx=\"10\" cy=\"10\" r=\"6.5\" stroke-dasharray=\"2.4 2.2\"></circle><path d=\"M8.2 8.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.2M10 13.6v.1\"></path>" }}></svg></span><b>{"Investigate a gap"}</b><small>{"Find what you don't know that could change the plan"}</small></button>
              <button type="button" className="va-chip va-sugg" data-q="What evidence supports or contradicts our main assumption?"><span className="va-sugg-ic"><svg className="vi" viewBox="0 0 20 20" aria-hidden="true" dangerouslySetInnerHTML={{ __html: "<path d=\"M4 10.5l3.5 3.5L16 5.5\"></path>" }}></svg></span><b>{"Test an assumption"}</b><small>{"Check the evidence for and against a belief"}</small></button>
              <button type="button" className="va-chip va-more-chip" data-q="How have prices in our category changed recently?" hidden>{"Track prices"}</button>
              <button type="button" className="va-chip va-more-chip" data-q="Where do stockouts happen most often?" hidden>{"Map stockouts"}</button>
              <button type="button" className="va-chip va-more-chip" data-q="What has changed about our main competitor recently?" hidden>{"Check a competitor"}</button>
              <button type="button" className="va-chip va-dots" id="va-chip-more" aria-label="More examples" aria-expanded="false">
                <svg className="vi" viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="5" cy="10" r="1.1"></circle>
                  <circle cx="10" cy="10" r="1.1"></circle>
                  <circle cx="15" cy="10" r="1.1"></circle>
                </svg>
              </button>
            </div>
            {" "}
            {" "}
          </div>
          {" "}
        </section>
        {" "}
      </div>
      {" "}
    </dialog>
  );
}
