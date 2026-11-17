// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function AuthDialog() {
  return (
    <dialog id="auth" className="va" aria-labelledby="a-title">
      {" "}
      <div className="dlg">
        {" "}
        <div className="a-top">
          {" "}
          <div className="a-tabs" role="tablist" aria-label="Account">
            {" "}
            <button role="tab" data-mode="in" aria-selected="true">{"Sign in"}</button>
            {" "}
            <button role="tab" data-mode="up" aria-selected="false" tabIndex="-1">{"Sign up"}</button>
            {" "}
          </div>
          {" "}
          <button type="button" className="x" id="a-x" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#1F273F" strokeWidth="1.6" strokeLinecap="round"></path></svg>
          </button>
          {" "}
        </div>
        {" "}
        <div className="stp">
          {" "}
          <h2 id="a-title">{"Welcome back"}</h2>
          {" "}
          <p id="a-lead">{"Sign in to your Verisavo account."}</p>
          {" "}
          <a className="btn a-google wide" id="a-google" href="#" target="_blank" rel="noopener noreferrer">
            {" "}
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="6.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.6"></circle>
              <path d="M3.2 15.5c.8-2.8 3-4.2 5.8-4.2s5 1.4 5.8 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"></path>
            </svg>
            {" Continue with Google "}
          </a>
          {" "}
          <div className="a-or"><span>{"or"}</span></div>
          {" "}
          <form id="a-form" className="a-form" noValidate>
            {" "}
            <div className="a-field a-up" hidden>
              <label className="field-label" htmlFor="a-name">{"Full name"}</label>
              <input id="a-name" autoComplete="name" maxLength="120" />
            </div>
            {" "}
            <div className="a-field a-up" hidden>
              <label className="field-label" htmlFor="a-org">{"Organisation "}<span style={{ fontWeight: "400", color: "var(--b600)" }}>{"(optional)"}</span></label>
              <input id="a-org" autoComplete="organization" maxLength="160" />
            </div>
            {" "}
            <div className="a-field">
              <label className="field-label" htmlFor="a-email">{"Email"}</label>
              <input id="a-email" type="email" autoComplete="email" maxLength="160" placeholder="you@company.com" />
            </div>
            {" "}
            <button type="submit" className="btn btn-dark wide" id="a-submit">{"Continue with email"}</button>
            {" "}
          </form>
          {" "}
          <div id="a-sent" className="a-sent" hidden><b>{"Check your inbox"}</b><p>{"We sent a sign-in link to "}<span id="a-sent-to"></span>{"."}</p></div>
          {" "}
          <p className="msg a-msg" id="a-msg" aria-live="polite"></p>
          {" "}
          <p className="a-switch">
            <span id="a-switch-text">{"New to Verisavo?"}</span>
            {" "}
            <button type="button" className="linkish" id="a-switch">{"Sign up"}</button>
          </p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </dialog>
  );
}
