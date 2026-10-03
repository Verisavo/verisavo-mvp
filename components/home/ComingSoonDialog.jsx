// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function ComingSoonDialog() {
  return (
    <dialog id="soon" className="va" aria-labelledby="soon-h">
      {" "}
      <div className="dlg">
        {" "}
        <div className="dlg-top">
          <button type="button" className="x" data-soon-close="" aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#1F273F" strokeWidth="1.6" strokeLinecap="round"></path></svg>
          </button>
        </div>
        {" "}
        <div className="stp">
          {" "}
          <div className="ok soon-ic" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="#1F273F" strokeWidth="1.3" strokeLinecap="round">
              <path d="M8 14.5s4.5-4.2 4.5-7.6a4.5 4.5 0 0 0-9 0c0 3.4 4.5 7.6 4.5 7.6z"></path>
              <circle cx="8" cy="6.8" r="1.6"></circle>
            </svg>
          </div>
          {" "}
          <p className="soon-lab">{"Coming soon"}</p>
          {" "}
          <h2 id="soon-h">{"Deploy a Scout"}</h2>
          {" "}
          <p>
            {"Soon you will be able to send SavoScouts to gather and verify Ground-Level Intelligence where existing information falls short. We are preparing this now."}
          </p>
          {" "}
          <button type="button" className="btn btn-primary wide" data-soon-close="">{"Got it"}</button>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </dialog>
  );
}
