// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function ResearchDetail() {
  return (
    <div className="rs-detail" id="rs-detail" role="dialog" aria-modal="true" aria-labelledby="rd-title" aria-hidden="true">
      {" "}
      <div className="rd-in">
        {" "}
        <button type="button" className="pg-link rd-back" id="rd-back"><span aria-hidden="true">{"←"}</span>{" "}<span id="rd-back-l">{"All research"}</span></button>
        {" "}
        <div className="rd-art" id="rd-art"></div>
        {" "}
        <div className="rd-body">
          {" "}
          <div className="rd-top">
            <p className="rs-meta" id="rd-meta"></p>
            <span className="rs-soon" id="rd-tag">{"Coming soon"}</span>
          </div>
          {" "}
          <h1 id="rd-title" tabIndex="-1"></h1>
          {" "}
          <p className="rd-sub" id="rd-sub"></p>
          {" "}
          <div className="rd-text" id="rd-text"></div>
          {" "}
          <p className="rd-note" id="rd-note">
            {"This study is in preparation. Want to hear when it is published, or have a question it should answer?"}
          </p>
          {" "}
          <div className="acts" id="rd-acts">
            <button type="button" className="obtn solid" data-soon="study">{"Get early access"}</button>
            <button type="button" className="obtn" data-ask="">{"Ask Verisavo"}</button>
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  );
}
