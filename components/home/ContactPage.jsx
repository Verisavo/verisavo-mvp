// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function ContactPage() {
  return (
    <section className="pg" id="pg-contact" aria-labelledby="contact-h" aria-hidden="true">
      {" "}
      <div className="pg-in pg-narrow">
        {" "}
        <button type="button" className="pg-link pg-back" data-back=""><span aria-hidden="true">{"←"}</span>{" Back"}</button>
        {" "}
        <header className="pg-head"><h1 id="contact-h"><span className="acc">{"Get"}</span>{" in touch"}</h1></header>
        {" "}
        <div className="info3">
          {" "}
          <div>
            <span className="lab">{"Early access"}</span>
            <p>{"Try Verisavo with your team."}</p>
            <button type="button" className="pg-link" data-dialog="access">{"Get early access "}<span aria-hidden="true">{"→"}</span></button>
          </div>
          {" "}
          <div>
            <span className="lab">{"Company"}</span>
            <p>{"Learn what we are building."}</p>
            <button type="button" className="pg-link" data-page="about-us">{"About Verisavo "}<span aria-hidden="true">{"→"}</span></button>
          </div>
          {" "}
        </div>
        {" "}
        <form className="cform" id="cform" noValidate>
          {" "}
          <div className="row2">
            {" "}
            <label>
              <span className="lab">{"Name"}</span>
              <input id="cf-name" autoComplete="name" maxLength="120" placeholder="Your name" />
            </label>
            {" "}
            <label>
              <span className="lab">{"Work email"}</span>
              <input id="cf-email" type="email" autoComplete="email" maxLength="160" placeholder="you@company.com" />
            </label>
            {" "}
          </div>
          {" "}
          <label>
            <span className="lab">{"Message"}</span>
            <textarea id="cf-msg" maxLength="3000" placeholder="Tell us about the market or decision you are working on" />
          </label>
          {" "}
          <p className="note">
            {"Your message is handled as described in our "}
            <button type="button" data-legal="privacy">{"Privacy Policy"}</button>
            {"."}
          </p>
          {" "}
          <div><button type="submit" className="obtn" id="cf-send">{"Send message"}</button></div>
          {" "}
          <div className="cstatus glass" id="cf-status" role="status" hidden></div>
          {" "}
        </form>
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
