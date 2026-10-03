// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function EarlyAccessDialog() {
  return (
    <dialog id="access" className="va" aria-labelledby="access-h">
      {" "}
      <div className="dlg">
        {" "}
        <div className="dlg-top">
          {" "}
          <button type="button" className="x" id="x" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#1F273F" strokeWidth="1.6" strokeLinecap="round"></path></svg>
          </button>
          {" "}
        </div>
        {" "}
        <form className="stp" id="step1" noValidate>
          {" "}
          <h2 id="access-h">{"Get early access"}</h2>
          {" "}
          <p>{"Enter your number. We'll send a one-time code to confirm it's yours."}</p>
          {" "}
          <div style={{ display: "grid", gap: "8px" }}>
            {" "}
            <span className="field-label" id="phone-l">{"Your number"}</span>
            {" "}
            <div className="phone" id="phone-box" role="group" aria-labelledby="phone-l">
              {" "}
              <label htmlFor="cc" className="vh">{"Country code"}</label>
              {" "}
              <select id="cc" autoComplete="tel-country-code"></select>
              {" "}
              <label htmlFor="tel" className="vh">{"Phone number"}</label>
              {" "}
              <input id="tel" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="801 234 5678" maxLength="20" />
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <label className="consent">
            <input type="checkbox" id="consent" />
            <span>{"I agree to receive a verification code and early-access messages from Verisavo."}</span>
          </label>
          {" "}
          <p className="msg" id="m1" aria-live="polite"></p>
          {" "}
          <button type="submit" className="btn btn-primary wide" id="send-code">{"Send code"}</button>
          {" "}
        </form>
        {" "}
        <form className="stp" id="step2" noValidate hidden>
          {" "}
          <h2>{"Enter your code"}</h2>
          {" "}
          <p>{"We sent a 6-digit code to "}<span className="num" id="num-show"></span></p>
          {" "}
          <fieldset style={{ border: "0", padding: "0", margin: "0" }}>
            {" "}
            <legend className="vh">{"6-digit verification code"}</legend>
            {" "}
            <div className="otp" id="otp"></div>
            {" "}
          </fieldset>
          {" "}
          <p className="msg" id="m2" aria-live="polite"></p>
          {" "}
          <button type="submit" className="btn btn-primary wide" id="verify">{"Verify"}</button>
          {" "}
          <div className="row">
            {" "}
            <button type="button" className="textbtn" id="change">{"Change number"}</button>
            {" "}
            <button type="button" className="textbtn" id="resend" disabled>{"Resend code"}</button>
            {" "}
          </div>
          {" "}
        </form>
        {" "}
        <div className="stp" id="step3" hidden tabIndex="-1">
          {" "}
          <div className="ok" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 30 30">
              <path d="M8 15.5l4.5 4.5L22 10.5" fill="none" stroke="#1F273F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          {" "}
          <h2>{"You're verified"}</h2>
          {" "}
          <p>{"Continue to WhatsApp to start your early-access conversation with our team."}</p>
          {" "}
          <div className="preview"><small>{"Your first message"}</small><p id="wa-text"></p></div>
          {" "}
          <a className="btn btn-primary wide" id="wa-link" href="#" target="_blank" rel="noopener noreferrer">
            {"Open WhatsApp "}
            <svg className="ic" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            {" "}
          </a>
          {" "}
          <p className="msg" id="m3"></p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </dialog>
  );
}
