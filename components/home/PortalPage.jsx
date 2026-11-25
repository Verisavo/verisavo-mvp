// SavoScout Opportunities portal. Markup is rendered by lib/home/portal.js from lib/home/portalData.js.
export default function PortalPage() {
  return (
    <section className="pg" id="pg-portal" aria-labelledby="pt-h" aria-hidden="true">
      <div className="pg-in">
        <button type="button" className="pg-link pg-back" data-back=""><span aria-hidden="true">{"←"}</span>{" Back"}</button>
        <div className="pt-mount" />
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
          <nav className="foot-cols foot-min" aria-label="Footer"><a href="/platform">{"Product"}</a><button type="button" data-page="use-cases">{"Use cases"}</button><button type="button" data-page="pricing">{"Pricing"}</button><button type="button" data-page="research" data-tab="research">{"Insights"}</button><a href="/docs">{"Docs"}</a><button type="button" data-page="about-us">{"About us"}</button><button type="button" data-page="careers">{"Careers"}</button><button type="button" data-page="community-tasks">{"Opportunities"}</button><button type="button" data-page="contact">{"Contact us"}</button><button type="button" data-page="admin">{"Admin"}</button><button type="button" data-page="community">{"Community"}</button></nav>
          <div className="foot-bar">
            {" "}
            <span>{"© 2026 Verisavo. All rights reserved."}</span>
            {" "}
            <nav aria-label="Legal">
            <button type="button" data-orig-signin="">{"Sign in"}</button>
              <button type="button" data-legal="terms">{"Terms of Service"}</button>
              <button type="button" data-legal="privacy">{"Privacy Policy"}</button>
            </nav>
            {" "}
          </div>
          {" "}
        </footer>
      </div>
    </section>
  );
}
