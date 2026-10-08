// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function PricingPage() {
  return (
    <section className="pg" id="pg-pricing" aria-labelledby="pricing-h" aria-hidden="true">
      {" "}
      <div className="pg-in pg-narrow">
        {" "}
        <button type="button" className="pg-link pg-back" data-back=""><span aria-hidden="true">{"←"}</span>{" Back"}</button>
        {" "}
        <header className="pg-head pr-head">
          <p className="lab">{"Pricing"}</p>
          <h1 id="pricing-h">{"Start free. "}<span className="acc">{"Go further when you need to."}</span></h1>
          <p className="pr-lead">{"Ask your first market questions free. Upgrade when you need more intelligence, context and continuity."}</p>
        </header>
        {" "}
        <div className="pr-plans">
          <article className="pr-card glass" aria-labelledby="pr-free">
            <p className="lab" id="pr-free">{"Free"}</p>
            <p className="pr-price">{"$0"}</p>
            <p className="pr-name">{"Explore Verisavo."}</p>
            <p className="pr-line">{"Ask your first 5 market questions free."}</p>
            <ul className="pr-list">
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"5 questions"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"Web access"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"No card required"}</span></li>
            </ul>
            <button type="button" className="obtn pr-cta" data-signup="">{"Start free "}<span aria-hidden="true">{"→"}</span></button>
          </article>
          {" "}
          <article className="pr-card pr-main" aria-labelledby="pr-monthly">
            <p className="pr-tier"><span className="lab" id="pr-monthly">{"Verisavo"}</span><span className="pr-tag">{"Monthly"}</span></p>
            <p className="pr-price">{"$5.99 "}<span>{"/ month"}</span></p>
            <p className="pr-line">{"For businesses that need answers more often."}</p>
            <ul className="pr-list">
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"Up to 100 messages per month"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"Web + WhatsApp"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"File & image uploads"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"PDF reports"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"Saved conversations"}</span></li>
              <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg><span>{"Verisavo Dashboard"}</span></li>
            </ul>
            <p className="pr-one">{"One account. One subscription. Cancel anytime."}</p>
            <button type="button" className="obtn solid pr-cta" data-ask="">{"Ask Verisavo "}<span aria-hidden="true">{"→"}</span></button>
          </article>
          {" "}
          <article className="pr-card glass pr-next" aria-labelledby="pr-pro">
            <p className="pr-tier"><span className="lab" id="pr-pro">{"Verisavo Pro"}</span><span className="pr-tag pr-tag-soon">{"Coming soon"}</span></p>
            <p className="pr-soon">{"Go deeper."}</p>
            <p className="pr-line">{"For businesses that need continuous market intelligence, not just individual answers."}</p>
            <p className="pr-with">{"Coming with:"}</p>
            <ul className="pr-list pr-list-soon">
              <li><i aria-hidden="true"></i><span>{"Investigations"}</span></li>
              <li><i aria-hidden="true"></i><span>{"Company Knowledge Base"}</span></li>
              <li><i aria-hidden="true"></i><span>{"Team workflows"}</span></li>
              <li><i aria-hidden="true"></i><span>{"Deeper market analysis"}</span></li>
              <li><i aria-hidden="true"></i><span>{"Targeted Ground-Level Intelligence"}</span></li>
            </ul>
            <button type="button" className="obtn pr-cta" data-dialog="access">{"Join the waitlist "}<span aria-hidden="true">{"→"}</span></button>
          </article>
        </div>
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
