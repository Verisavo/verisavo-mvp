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
        <div className="ca-grid ca-grid1">
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
          {" "}
        </div>
        <section className="ca-roles" aria-labelledby="roles-h">
          <div className="ca-roles-head"><h2 id="roles-h">{"Open roles"}</h2><span className="ca-count">{"7 roles"}</span></div>
          <ul className="ca-list">
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20Founding%20full-stack%20engineer"><span className="ca-role"><b>{"Founding full-stack engineer"}</b><span>{"Build the product end to end, from the Intelligence Assistant to the tools teams use every day."}</span></span><span className="ca-team">{"Engineering"}</span><span className="ca-loc">{"Remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20Data%20and%20evidence%20engineer"><span className="ca-role"><b>{"Data and evidence engineer"}</b><span>{"Build the pipelines that turn sources into evidence, with provenance, time and place kept intact."}</span></span><span className="ca-team">{"Engineering"}</span><span className="ca-loc">{"Remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20Applied%20AI%20engineer"><span className="ca-role"><b>{"Applied AI engineer"}</b><span>{"Make answers traceable: retrieval, evaluation, and labelling what the evidence does and does not support."}</span></span><span className="ca-team">{"Engineering"}</span><span className="ca-loc">{"Remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20Market%20intelligence%20analyst"><span className="ca-role"><b>{"Market intelligence analyst"}</b><span>{"Investigate real market questions, scope Intelligence Gaps and turn findings into evidence."}</span></span><span className="ca-team">{"Research"}</span><span className="ca-loc">{"Remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20SavoScouts%20operations%20lead"><span className="ca-role"><b>{"SavoScouts operations lead"}</b><span>{"Recruit, train and support SavoScouts, and keep Ground-Level Intelligence accurate and consented."}</span></span><span className="ca-team">{"Field operations"}</span><span className="ca-loc">{"Africa, remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20Product%20designer"><span className="ca-role"><b>{"Product designer"}</b><span>{"Make complex evidence easy to read, from labelled answers to the Market Intelligence Network."}</span></span><span className="ca-team">{"Design"}</span><span className="ca-loc">{"Remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
            <li><a href="mailto:career@verisavo.com?subject=Application%3A%20Partnerships%20lead"><span className="ca-role"><b>{"Partnerships lead"}</b><span>{"Work with businesses, data partners and research groups to bring more evidence into Verisavo."}</span></span><span className="ca-team">{"Partnerships"}</span><span className="ca-loc">{"Remote"}</span><span className="ca-go" aria-hidden="true">{"→"}</span></a></li>
          </ul>
        </section>
        {" "}
        <section className="ca-apply" aria-labelledby="capply-h">
          {" "}
          <h2 id="capply-h">{"Don’t see your role? "}<span className="acc">{"Send a short note."}</span></h2>
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
