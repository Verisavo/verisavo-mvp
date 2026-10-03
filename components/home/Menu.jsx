// Converted from the original static page. Markup only: behaviour lives in lib/home/.
export default function Menu() {
  return (
    <div className="mnav" id="menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
      {" "}
      <div className="mnav-main">
        {" "}
        <ul className="mnav-big">
          {" "}
          <li style={{ "--i": "0" }}><button type="button" data-ask="">{"Platform"}</button></li>
          {" "}
          <li style={{ "--i": "1" }}><button type="button" data-page="about-us">{"About us"}</button></li>
          {" "}
          <li style={{ "--i": "2" }}><button type="button" data-page="research">{"Research"}</button></li>
          {" "}
          <li style={{ "--i": "3" }}><button type="button" data-page="contact">{"Contact us"}</button></li>
          {" "}
        </ul>
        {" "}
        <ul className="mnav-small">
          {" "}
          <li style={{ "--i": "6" }}><button type="button" data-dialog="access">{"Deploy Scout"}</button></li>
          {" "}
          <li style={{ "--i": "7" }}><button type="button" data-page="pricing">{"Pricing"}</button></li>
          {" "}
          <li style={{ "--i": "8" }}><button type="button" data-page="careers">{"Careers"}</button></li>
          {" "}
          <li style={{ "--i": "9" }}><button type="button" data-dialog="signin">{"Sign in"}</button></li>
          {" "}
        </ul>
        {" "}
      </div>
      {" "}
      <div className="mnav-foot">
        {" "}
        <span>{"© 2026 Verisavo. All rights reserved."}</span>
        {" "}
        <nav aria-label="Legal">
          <button type="button" data-legal="terms">{"Terms"}</button>
          <button type="button" data-legal="privacy">{"Privacy"}</button>
        </nav>
        {" "}
        <nav aria-label="Company">
          <button type="button" data-page="about-us">{"About"}</button>
          <button type="button" data-page="contact">{"Contact"}</button>
        </nav>
        {" "}
      </div>
      {" "}
    </div>
  );
}
