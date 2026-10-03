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
          {" "}
          <p className="lab">{"Pricing"}</p>
          {" "}
          <h1 id="pricing-h">{"Start free. "}<span className="acc">{"Upgrade when you need more."}</span></h1>
          {" "}
        </header>
        {" "}
        <div className="pr-plans">
          {" "}
          <article className="pr-card glass">
            {" "}
            <p className="lab">{"Free"}</p>
            {" "}
            <p className="pr-price">{"$0"}</p>
            {" "}
            <p className="pr-line">{"Ask your first 5 questions free."}</p>
            {" "}
          </article>
          {" "}
          <article className="pr-card pr-main">
            {" "}
            <p className="lab">{"Monthly"}</p>
            {" "}
            <p className="pr-price">{"$5 "}<span>{"/ month"}</span></p>
            {" "}
            <p className="pr-unlock">{"Unlock:"}</p>
            {" "}
            <ul className="pr-list">
              <li>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg>
                <span>{"Up to 100 messages per month"}</span>
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg>
                <span>{"Web + WhatsApp"}</span>
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg>
                <span>{"File & image uploads"}</span>
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg>
                <span>{"PDF reports"}</span>
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg>
                <span>{"Saved conversations"}</span>
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"></path></svg>
                <span>{"Verisavo Dashboard"}</span>
              </li>
            </ul>
            {" "}
            <p className="pr-one">{"One account. One subscription."}</p>
            {" "}
            <button type="button" className="obtn solid pr-cta" data-ask="">{"Ask Verisavo "}<span aria-hidden="true">{"→"}</span></button>
            {" "}
          </article>
          {" "}
          <article className="pr-card glass pr-next">
            {" "}
            <p className="lab">{"Launching soon"}</p>
            {" "}
            <p className="pr-soon">{"Verisavo Pro"}</p>
            {" "}
            <p className="pr-line">{"For when one market isn't enough."}</p>
            {" "}
            <div className="pr-ghost" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            {" "}
          </article>
          {" "}
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
