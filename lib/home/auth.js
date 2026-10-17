// Early access and sign in dialogs
// Runs once in the browser after the page has rendered (see the page's client component).
import setupAuthDialog, { authLive, fetchUser, markSignedIn, openAssistant, startFreeLive } from "@/lib/authDialog";

export default function init() {
  /* Early access and sign in, opened in place over the homepage (same flows as the Assistant page) */
  (() => {
    const CONFIG = { mode: "demo", api: { start: "", check: "" }, whatsappNumber: "", resendSeconds: 30 };
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    let pendingQ = "";
    /* Early access: WhatsApp number -> code -> WhatsApp */
    const COUNTRIES = [["NG","Nigeria","234"],["GH","Ghana","233"],["KE","Kenya","254"],["ZA","South Africa","27"],["CI","Côte d'Ivoire","225"],["SN","Senegal","221"],["CM","Cameroon","237"],["EG","Egypt","20"],["MA","Morocco","212"],["ET","Ethiopia","251"],["TZ","Tanzania","255"],["UG","Uganda","256"],["RW","Rwanda","250"],["ZM","Zambia","260"],["GB","United Kingdom","44"],["US","United States","1"],["FR","France","33"],["AE","United Arab Emirates","971"]];
    const cc = $("#cc");
    COUNTRIES.forEach(([c, name, dial]) => { const o = document.createElement("option"); o.value = dial; o.textContent = c + " +" + dial; o.setAttribute("aria-label", name + " +" + dial); cc.appendChild(o); });

    const dlg = $("#access"), stepsEl = [$("#step1"), $("#step2"), $("#step3")];
    const tel = $("#tel"), consent = $("#consent"), box = $("#phone-box"), m1 = $("#m1"), m2 = $("#m2"), m3 = $("#m3");
    let phone = "", opener = null, resendTimer = 0, verified = false, checking = false;

    function show(n) {
      stepsEl.forEach((s, i) => s.hidden = i !== n);
    }
    function openAccess() {
      opener = document.activeElement;
      if (!verified) { show(0); m1.textContent = ""; }
      dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "");
      setTimeout(() => (verified ? $("#wa-link") : tel).focus(), 30);
    }
    const close = () => dlg.close ? dlg.close() : dlg.removeAttribute("open");
    dlg.addEventListener("close", () => opener && opener.focus && opener.focus());
    $("#x").addEventListener("click", close);
    dlg.addEventListener("click", e => { if (e.target === dlg) close(); });
    $$("[data-access]").forEach(b => b.addEventListener("click", () => openStart("")));
    tel.addEventListener("input", () => { tel.value = tel.value.replace(/[^\d\s-]/g, ""); box.classList.remove("bad"); m1.textContent = ""; });
    consent.addEventListener("change", () => m1.textContent = "");

    const wait = ms => new Promise(r => setTimeout(r, ms));
    const busy = (btn, on, label) => { btn.disabled = on; btn.innerHTML = on ? '<span class="spin" aria-hidden="true"></span>' + label : label; };
    async function post(url, body) {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
      let data = {}; try { data = await r.json(); } catch {}
      if (!r.ok) throw Object.assign(new Error("failed"), { status: r.status });
      return data;
    }
    async function sendCode() {
      if (CONFIG.mode !== "live") return wait(700);
      if (!CONFIG.api.start) throw { config: true };
      return post(CONFIG.api.start, { phone: "+" + phone, question: pendingQ.trim() });
    }
    async function checkCode(code) {
      if (CONFIG.mode !== "live") { await wait(600); return { verified: code === "123456" }; }
      if (!CONFIG.api.check) throw { config: true };
      return post(CONFIG.api.check, { phone: "+" + phone, code });
    }

    $("#step1").addEventListener("submit", async e => {
      e.preventDefault();
      const digits = tel.value.replace(/\D/g, "").replace(/^0+/, "");
      if (digits.length < 7 || (cc.value + digits).length > 15) { box.classList.add("bad"); m1.textContent = "Enter a valid number without the country code."; tel.focus(); return; }
      if (!consent.checked) { m1.textContent = "Tick the box to receive the code."; consent.focus(); return; }
      phone = cc.value + digits;
      const btn = $("#send-code"); busy(btn, true, "Sending…");
      try {
        await sendCode();
        $("#num-show").textContent = "+" + cc.value + " " + tel.value.trim().replace(/^0+/, "");
        buildOtp(); show(1); startResend(); $$("#otp input")[0].focus();
      } catch (err) {
        m1.textContent = err.config ? "Verification isn't connected yet. Please try again later." : err.status === 429 ? "Too many attempts. Try again in a few minutes." : "We couldn't send the code. Check the number and try again.";
      } finally { busy(btn, false, "Send code"); }
    });

    function buildOtp() {
      const otp = $("#otp"); otp.innerHTML = ""; otp.classList.remove("bad"); m2.textContent = "";
      for (let i = 0; i < 6; i++) { const inp = document.createElement("input"); inp.type = "text"; inp.inputMode = "numeric"; inp.maxLength = 1; inp.setAttribute("aria-label", "Digit " + (i + 1) + " of 6"); if (!i) inp.autocomplete = "one-time-code"; otp.appendChild(inp); }
      const ins = $$("#otp input");
      const fill = (str, from) => { str.slice(0, 6 - from).split("").forEach((ch, k) => { ins[from + k].value = ch; ins[from + k].classList.add("filled"); }); (ins.find(x => !x.value) || ins[5]).focus(); if (ins.every(x => x.value)) $("#step2").requestSubmit(); };
      ins.forEach((inp, i) => {
        inp.addEventListener("input", () => {
          const v = inp.value.replace(/\D/g, "");
          if (v.length > 1) return fill(v, i);
          inp.value = v; inp.classList.toggle("filled", !!v); otp.classList.remove("bad"); m2.textContent = "";
          if (v && i < 5) ins[i + 1].focus();
          if (ins.every(x => x.value)) $("#step2").requestSubmit();
        });
        inp.addEventListener("keydown", e => {
          if (e.key === "Backspace" && !inp.value && i > 0) { e.preventDefault(); ins[i - 1].value = ""; ins[i - 1].classList.remove("filled"); ins[i - 1].focus(); }
          if (e.key === "ArrowLeft" && i > 0) ins[i - 1].focus();
          if (e.key === "ArrowRight" && i < 5) ins[i + 1].focus();
        });
        inp.addEventListener("paste", e => { e.preventDefault(); fill((e.clipboardData.getData("text") || "").replace(/\D/g, ""), i); });
        inp.addEventListener("focus", () => inp.select());
      });
    }
    function startResend() {
      const btn = $("#resend"); let s = CONFIG.resendSeconds; clearInterval(resendTimer);
      btn.disabled = true; btn.textContent = "Resend in " + s + "s";
      resendTimer = setInterval(() => { s--; if (s <= 0) { clearInterval(resendTimer); btn.disabled = false; btn.textContent = "Resend code"; } else btn.textContent = "Resend in " + s + "s"; }, 1000);
    }
    $("#resend").addEventListener("click", async () => { try { await sendCode(); m2.textContent = ""; startResend(); $$("#otp input")[0].focus(); } catch { m2.textContent = "We couldn't resend the code. Try again shortly."; } });
    $("#change").addEventListener("click", () => { clearInterval(resendTimer); show(0); tel.focus(); });

    $("#step2").addEventListener("submit", async e => {
      e.preventDefault();
      if (checking) return;
      const otp = $("#otp"), code = $$("#otp input").map(x => x.value).join("");
      if (code.length < 6) { otp.classList.add("bad"); m2.textContent = "Enter all 6 digits."; return; }
      checking = true; const btn = $("#verify"); busy(btn, true, "Checking…");
      try {
        const res = await checkCode(code);
        if (!res || !res.verified) throw { wrong: true };
        verified = true; clearInterval(resendTimer); finish(res.whatsappUrl);
      } catch (err) {
        otp.classList.remove("shake"); void otp.offsetWidth; otp.classList.add("bad", "shake");
        m2.textContent = err.wrong || err.status === 400 || err.status === 401 ? "That code doesn't match. Try again." : err.status === 429 ? "Too many attempts. Request a new code." : "We couldn't check the code. Try again.";
        $$("#otp input").forEach(x => { x.value = ""; x.classList.remove("filled"); }); $$("#otp input")[0].focus();
      } finally { checking = false; busy(btn, false, "Verify"); }
    });

    function finish(url) {
      const q = pendingQ.trim();
      const text = "Hi Verisavo, I'd like early access." + (q ? "\n\nMy question: " + q : "");
      $("#wa-text").textContent = text;
      const link = $("#wa-link");
      const href = url || (CONFIG.whatsappNumber ? "https://wa.me/" + CONFIG.whatsappNumber.replace(/\D/g, "") + "?text=" + encodeURIComponent(text) : "");
      if (href) { link.href = href; link.removeAttribute("aria-disabled"); link.removeAttribute("tabindex"); m3.textContent = ""; }
      else { link.href = "#"; link.setAttribute("aria-disabled", "true"); link.tabIndex = -1; m3.textContent = "The Verisavo WhatsApp number hasn't been added to this page yet."; }
      show(2); $("#step3").focus();
    }

    /* ---------- Sign in / Sign up (lib/authDialog.ts) ----------
     * Signed in, the homepage's sign-in buttons read "Dashboard" and go there. Before M1 is released the dialog runs
     * the old demo instead: a pretend user kept in this browser session, then the Assistant on the Platform page.
     */
    const demoUser = () => { try { return JSON.parse(sessionStorage.getItem("verisavo-user") || "null"); } catch (e) { return null; } };
    let liveUser = null;
    if (authLive()) fetchUser().then(u => { liveUser = u; if (u) markSignedIn(); });
    const signedIn = () => authLive() ? !!liveUser : !!demoUser();
    const toApp = () => { location.href = authLive() ? "/dashboard" : "/platform#app"; };
    const authDlg = setupAuthDialog({
      onSignedIn: () => { location.href = "/dashboard"; },
      onDemo: user => { try { sessionStorage.setItem("verisavo-user", JSON.stringify(user)); } catch (e) {} toApp(); }
    });
    const openAuth = mode => authDlg.open(mode);
    $$("[data-login]").forEach(b => b.addEventListener("click", () => signedIn() ? toApp() : openAuth("in")));
    $$("[data-signup]").forEach(b => b.addEventListener("click", () => openAuth("up")));

    // M5.3: once M5 is released, "early access" means "Start free": sign up (signed in: straight to the assistant)
    function openStart(q) {
      if (!startFreeLive()) { pendingQ = q || ""; openAccess(); return; }
      if (signedIn()) openAssistant(q || ""); else openAuth("up");
    }
    window.vsOpenAccess = q => openStart(q);
    window.vsOpenAuth = mode => signedIn() ? toApp() : openAuth(mode || "in");
  })();
}
