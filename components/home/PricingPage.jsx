// Converted from the original static page. Markup only: behaviour lives in lib/home/.
const PRICING = "<div class=\"pc\"><header class=\"pg-head pc-head\"><p class=\"lab\">Early access pricing</p><h1 id=\"pricing-h\">Pricing</h1><p class=\"pc-lead\">Plans for individuals, teams and organisations.</p></header><div class=\"pc-plans\"><article class=\"pc-card\" aria-labelledby=\"pc-c\"><div class=\"pc-top\"><h2 class=\"pc-name\" id=\"pc-c\">Community</h2><p class=\"pc-for\">For individuals getting started</p></div><p class=\"pc-price\">$0</p><p class=\"pc-credit\">$3.99 of credit included</p><button type=\"button\" class=\"pc-btn\" data-signup>Sign up</button><p class=\"pc-inc\">Includes</p><ul class=\"pc-list\"><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Intelligence Assistant on the web</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Answers that show their evidence</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Intelligence Gaps named</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>No card required</span></li></ul></article><article class=\"pc-card pc-main\" aria-labelledby=\"pc-v\"><div class=\"pc-top\"><h2 class=\"pc-name\" id=\"pc-v\">Verisavo</h2><p class=\"pc-for\">For businesses that need answers often</p></div><p class=\"pc-price\">$6.99<span>/ month</span></p><p class=\"pc-credit\">Up to 100 messages a month</p><button type=\"button\" class=\"pc-btn pc-solid\" data-dialog=\"access\">Contact us</button><p class=\"pc-inc\">Everything in Community, plus</p><ul class=\"pc-list\"><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Web and WhatsApp</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>File and image uploads</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>PDF reports</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Saved conversations</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Verisavo Dashboard</span></li></ul><p class=\"pc-note\">One account. Cancel anytime.</p></article><article class=\"pc-card\" aria-labelledby=\"pc-e\"><div class=\"pc-top\"><h2 class=\"pc-name\" id=\"pc-e\">Enterprise</h2><p class=\"pc-for\">For organisations that need continuous market intelligence</p></div><p class=\"pc-price pc-custom\">Custom<span class=\"pc-soon\">Coming soon</span></p><p class=\"pc-credit\">Built around your markets</p><button type=\"button\" class=\"pc-btn\" data-page=\"contact\">Contact us</button><p class=\"pc-inc\">Everything in Verisavo, plus</p><ul class=\"pc-list\"><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Market investigations</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Company Knowledge Base</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Team workflows</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Advanced market analysis</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Targeted Ground-Level Intelligence through SavoScouts</span></li><li><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5l3 3 6-7\"/></svg><span>Your company data stays private and under your control</span></li></ul></article></div><p class=\"pc-fine\">Prices in US dollars. Early access prices may change before general release. Enterprise is coming soon, and its features are in development.</p></div>";

export default function PricingPage() {
  return (
    <section className="pg" id="pg-pricing" aria-labelledby="pricing-h" aria-hidden="true">
      {" "}
      <div className="pg-in pg-narrow">
        {" "}
        <button type="button" className="pg-link pg-back" data-back=""><span aria-hidden="true">{"←"}</span>{" Back"}</button>
        {" "}
        <div className="pc-mount" dangerouslySetInnerHTML={{ __html: PRICING }} />
        {" "}
        <footer className="pg-foot">
          {" "}
          <div className="foot-brand">
            {" "}
            <button type="button" className="logo" data-page="home" aria-label="Verisavo home">{"Verisavo"}</button>
            {" "}
            <span>{"The connected intelligence layer for African markets."}</span>
            {" "}
          </div>
          {" "}
          <nav className="foot-cols" aria-label="Footer"><div><h3>{"Product"}</h3><a href="/platform">{"Overview"}</a><button type="button" data-page="pricing">{"Pricing"}</button><a href="/docs">{"Docs"}</a><button type="button" data-dialog="signin">{"Sign in"}</button><button type="button" data-admin="">{"Admin"}</button></div><div><h3>{"Company"}</h3><button type="button" data-page="about-us">{"About us"}</button><button type="button" data-page="careers">{"Careers"}</button><button type="button" data-page="contact">{"Contact us"}</button><a href="mailto:hello@verisavo.com?subject=Investor%20enquiry">{"For investors"}</a></div><div><h3>{"Insights"}</h3><button type="button" data-page="research" data-tab="research">{"Research"}</button><button type="button" data-page="research" data-tab="articles">{"Articles"}</button><button type="button" data-page="research" data-tab="cases">{"Case studies"}</button></div></nav>
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
        </footer>
        {" "}
      </div>
      {" "}
    </section>
  );
}
