// Converted from the original static page. Markup only: behaviour lives in lib/home/.
const PRICING = "<div class=\"pc pc-after\"><header class=\"pg-head pc-head\"><p class=\"lab\">Pricing</p><h1 id=\"pricing-h\">Pricing that fits your markets.</h1><p class=\"pc-lead\">Plans depend on the markets you cover, how many people use Verisavo and how much Ground-Level Intelligence you need. We share pricing after your demo, once we understand the decision you’re working on.</p></header>\n<div class=\"pa-body\"><h2 class=\"pa-h2\">What shapes your price</h2><ul class=\"pa-list\"><li>The countries, cities and product categories you want to understand</li><li>How many people on your team use Verisavo</li><li>How often you need SavoScouts to investigate questions the existing evidence can’t answer</li></ul><button type=\"button\" class=\"obtn solid pa-cta\" data-page=\"demo\">Request a demo</button></div></div>\n";

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
            <span>{"The intelligence layer for African markets."}<br />{"Connect. Understand. Decide."}</span>
            {" "}
          </div>
          {" "}
          <nav className="foot-cols foot-min" aria-label="Footer"><a href="/platform">{"Product"}</a><button type="button" data-page="use-cases">{"Use cases"}</button><button type="button" data-page="pricing">{"Pricing"}</button><button type="button" data-page="research" data-tab="research">{"Insights"}</button><a href="/docs">{"Docs"}</a><button type="button" data-page="about-us">{"About us"}</button><button type="button" data-page="careers">{"Careers"}</button><button type="button" data-page="community-tasks">{"Open tasks"}</button><button type="button" data-page="contact">{"Contact us"}</button><button type="button" data-page="portal">{"Portal"}</button><button type="button" data-page="community">{"Become a SavoScout"}</button></nav>
          <div className="foot-bar">
            {" "}
            <span>{"© 2026 Verisavo. All rights reserved."}</span>
            {" "}
            <nav aria-label="Legal">
              <button type="button" data-admin="">{"Admin"}</button>
            <button type="button" data-orig-signin="">{"Sign in"}</button>
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
