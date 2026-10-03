// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function CareersPage() {
  return (
    <section className="pg" id="pg-careers" aria-labelledby="careers-h" aria-hidden="true">
      {" "}
      <div className="pg-in ca-in">
        {" "}
        <button type="button" className="pg-link pg-back" data-back=""><span aria-hidden="true">{"←"}</span>{" Back"}</button>
        {" "}
        <header className="pg-head">
          {" "}
          <p className="lab">{"Careers"}</p>
          {" "}
          <h1 id="careers-h">{"Build market understanding "}<span className="acc">{"for Africa."}</span></h1>
          {" "}
          <p className="lead">
            {"A small team connecting fragmented market evidence. We look for curious, careful people who care about getting things right."}
          </p>
          {" "}
        </header>
        {" "}
        <div className="ca-grid">
          {" "}
          <section aria-labelledby="cw-h">
            {" "}
            <p className="lab" id="cw-h">{"How we work"}</p>
            {" "}
            <ul className="ca-points">
              {" "}
              <li><b>{"Evidence over opinion."}</b>{" We say when something is still unknown."}</li>
              {" "}
              <li><b>{"Close to the market."}</b>{" We spend time with the people we serve."}</li>
              {" "}
              <li><b>{"Real ownership."}</b>{" Everyone shapes the product."}</li>
              {" "}
            </ul>
            {" "}
          </section>
          {" "}
          <section aria-labelledby="ca-h">
            {" "}
            <p className="lab" id="ca-h">{"Areas we hire in"}</p>
            {" "}
            <ul className="ca-tags">
              <li>{"Engineering"}</li>
              <li>{"Research"}</li>
              <li>{"Field operations"}</li>
              <li>{"Design"}</li>
              <li>{"Partnerships"}</li>
            </ul>
            {" "}
            <p className="ca-small">{"No listed openings right now. We still want to hear from you."}</p>
            {" "}
          </section>
          {" "}
        </div>
        {" "}
        <section className="ca-apply" aria-labelledby="capply-h">
          {" "}
          <h2 id="capply-h">{"Send your CV "}<span className="acc">{"and a short note."}</span></h2>
          {" "}
          <div className="ca-mail">
            <span className="ca-addr" id="ca-addr">{"career@verisavo.com"}</span>
            <button type="button" className="obtn" id="ca-copy">{"Copy email"}</button>
            <a className="obtn solid" href="mailto:career@verisavo.com?subject=Career%20enquiry">{"Email us "}<span aria-hidden="true">{"→"}</span></a>
          </div>
          {" "}
          <p className="ca-note" id="ca-note" aria-live="polite"></p>
          {" "}
        </section>
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
