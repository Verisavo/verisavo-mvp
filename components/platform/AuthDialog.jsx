// Sign in, sign up and password reset. Markup only: behaviour lives in lib/authDialog.js (shared with the homepage).
export default function AuthDialog() {
  return (
    <dialog id="auth" aria-labelledby="a-title">
      <div className="dlg">
        <div className="a-top">
          <div className="a-tabs" role="tablist" aria-label="Account">
            <button role="tab" data-mode="in" aria-selected="true">{"Sign in"}</button>
            <button role="tab" data-mode="up" aria-selected="false" tabIndex="-1">{"Sign up"}</button>
          </div>
          <button type="button" className="x" id="a-x" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#1F273F" strokeWidth="1.6" strokeLinecap="round"></path></svg>
          </button>
        </div>
        <div className="stp">
          <h2 id="a-title">{"Welcome back"}</h2>
          <p id="a-lead">{"Sign in to your Verisavo account."}</p>
          <div id="a-google-wrap" className="a-google-wrap" hidden>
            <button type="button" className="btn a-google wide" id="a-google">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"></path>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"></path>
                <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"></path>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"></path>
              </svg>
              {" Continue with Google"}
            </button>
            <div className="a-or"><span>{"or"}</span></div>
          </div>
          <form id="a-form" className="a-form" noValidate>
            <div className="a-field a-up" hidden>
              <label className="field-label" htmlFor="a-name">{"Full name"}</label>
              <input id="a-name" autoComplete="name" maxLength="120" />
            </div>
            <div className="a-field a-up" hidden>
              <label className="field-label" htmlFor="a-org">{"Organisation "}<span style={{ fontWeight: "400", color: "var(--b600)" }}>{"(optional)"}</span></label>
              <input id="a-org" autoComplete="organization" maxLength="160" />
            </div>
            <div className="a-field">
              <label className="field-label" htmlFor="a-email">{"Email"}</label>
              <input id="a-email" type="email" autoComplete="email" maxLength="160" placeholder="you@company.com" />
            </div>
            <div className="a-field a-pw">
              <label className="field-label" htmlFor="a-password">{"Password"}</label>
              <input id="a-password" type="password" autoComplete="current-password" maxLength="72" />
              <p className="a-hint a-up" hidden>{"At least 8 characters, with letters and numbers."}</p>
            </div>
            <button type="button" className="linkish a-forgot" id="a-forgot">{"Forgot password?"}</button>
            <button type="submit" className="btn btn-dark wide" id="a-submit">{"Sign in"}</button>
          </form>
          <div id="a-sent" className="a-sent" hidden>
            <b id="a-sent-title">{"Check your inbox"}</b>
            <p id="a-sent-text"></p>
            <button type="button" className="linkish" id="a-resend" hidden>{"Send the email again"}</button>
          </div>
          <p className="msg a-msg" id="a-msg" aria-live="polite"></p>
          <p className="a-switch">
            <span id="a-switch-text">{"New to Verisavo?"}</span>
            {" "}
            <button type="button" className="linkish" id="a-switch">{"Sign up"}</button>
          </p>
        </div>
      </div>
    </dialog>
  );
}
