"use client";
// The Verisavo Intelligence Assistant at /assistant (sign-in only), in the design of the original assistant window:
// it opens as a window and the full-screen button switches between window and full screen (remembered for the visit).
// Conversations are kept for this browser session until M3 stores them in the database.
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import DotFloor, { type FloorApi } from "./DotFloor";
import { ACCEPT, CHIPS, HANDOFF_KEY, MARKETS, MAX_FILES, MAX_MB, MORE_CHIPS } from "./data";
import * as I from "./icons";

export type AssistantUser = { id: string; name: string; email: string };

type UserItem = { id: string; role: "u"; text: string; scope: string; files: number };
type AnswerItem = { id: string; role: "a"; pending: boolean; title?: string; body?: string; answer?: string };
type Item = UserItem | AnswerItem;
type Conv = { id: string; title: string; items: Item[] };
type Pop = "scope" | "more" | "gear" | "shield" | null;

const CONVS_PREFIX = "verisavo-convs";   // + ":" + user id, so a shared browser never shows someone else's questions
const THEME_KEY = "verisavo-va-theme";
const FULL_KEY = "verisavo-va-full";
const uid = () => crypto.randomUUID();
const initials = (name: string) => name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "V";
const isNarrow = () => matchMedia("(max-width: 767px)").matches;

// The answer to a question. Until the Intelligence Assistant is connected (M3) it says so, and never makes one up.
// M3 replaces this with a call to /api/chat.
async function askAssistant(_question: string, _scope: string): Promise<Pick<AnswerItem, "title" | "body" | "answer">> {
  await new Promise(resolve => setTimeout(resolve, 700));
  return {
    title: "Your question is saved",
    body: "The Intelligence Assistant isn’t connected in this preview, so there is no answer yet. Your question stays in Recent for this session."
  };
}

const navBtn = "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-3 py-[9px] text-left text-[14.4px] leading-[1.2] font-medium text-ink no-underline hover:bg-brand-200";

export default function Assistant({ user }: { user: AssistantUser }) {
  const [full, setFull] = useState(false);              // window or full screen (phones are always full screen)
  const [convs, setConvs] = useState<Conv[]>([]);
  const [curId, setCurId] = useState<string | null>(null);
  const [scope, setScope] = useState<string>(MARKETS[0]);
  const [dark, setDark] = useState(true);
  const [pop, setPop] = useState<Pop>(null);
  const [collapsed, setCollapsed] = useState(false);   // desktop: sidebar hidden
  const [drawer, setDrawer] = useState(false);         // phones: sidebar slid in
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [moreChips, setMoreChips] = useState(false);

  const loaded = useRef(false);
  const popRef = useRef<Pop>(null);
  const lastTyped = useRef(0);
  const floor = useRef<FloorApi | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cur = convs.find(c => c.id === curId) ?? null;
  const hasThread = Boolean(cur?.items.length);
  const convsKey = `${CONVS_PREFIX}:${user.id}`;
  const displayName = (user.name || user.email.split("@")[0]).trim();
  const firstName = user.name.trim().split(" ")[0];
  const recent = convs.filter(c => c.title.toLowerCase().includes(query.trim().toLowerCase())).reverse();

  const ripple = (x: number, y: number, amp: number) => floor.current?.ripple(x, y, amp);
  const rippleFromComposer = (amp: number) => {
    const m = mainRef.current?.getBoundingClientRect(), c = formRef.current?.getBoundingClientRect();
    if (m && c) ripple(c.left - m.left + c.width / 2, c.top - m.top + 8, amp);
  };

  async function send(raw: string, scopeOverride?: string) {
    const question = raw.trim();
    if (!question) return;
    const sc = scopeOverride ?? scope;
    const u: UserItem = { id: uid(), role: "u", text: question, scope: sc, files: files.length };
    const a: AnswerItem = { id: uid(), role: "a", pending: true };
    const convId = curId && convs.some(c => c.id === curId) ? curId : uid();
    setConvs(prev => prev.some(c => c.id === convId)
      ? prev.map(c => (c.id === convId ? { ...c, items: [...c.items, u, a] } : c))
      : [...prev, { id: convId, title: question.length > 60 ? question.slice(0, 58) + "…" : question, items: [u, a] }]);
    setCurId(convId); setText(""); setFiles([]);
    rippleFromComposer(1.4);

    const result = await askAssistant(question, sc);
    setConvs(prev => prev.map(c => (c.id !== convId ? c : { ...c, items: c.items.map(it => (it.id === a.id ? { ...a, pending: false, ...result } : it)) })));
    // an answer arriving sends a softer wave from where it appears
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-answer="${a.id}"]`), m = mainRef.current;
      if (el && m) { const r = m.getBoundingClientRect(), b = el.getBoundingClientRect(); ripple(b.left - r.left + 40, b.top - r.top + b.height / 2, .8); }
    });
  }

  // First load: theme, this session's conversations, and a question handed over from the landing page
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try { if (localStorage.getItem(THEME_KEY) === "light") setDark(false); } catch {}
    try { if (sessionStorage.getItem(FULL_KEY) === "1") setFull(true); } catch {}
    try {
      // drop anything another user left in this browser tab
      Object.keys(sessionStorage).filter(k => k.startsWith(CONVS_PREFIX) && k !== convsKey).forEach(k => sessionStorage.removeItem(k));
      const saved = JSON.parse(sessionStorage.getItem(convsKey) || "[]") as Conv[];
      if (Array.isArray(saved) && saved.length) {
        setConvs(saved.map(c => ({ ...c, items: c.items.map(it => (it.role === "a" && it.pending ? { ...it, pending: false, title: "No answer", body: "This question was interrupted. Please ask it again." } : it)) })));
      }
    } catch {}
    let handoff: { q?: string; scope?: string } | null = null;
    try { handoff = JSON.parse(sessionStorage.getItem(HANDOFF_KEY) || "null"); sessionStorage.removeItem(HANDOFF_KEY); } catch {}
    const sc = handoff?.scope && (MARKETS as readonly string[]).includes(handoff.scope) ? handoff.scope : undefined;
    if (sc) setScope(sc);
    if (handoff?.q?.trim()) void send(handoff.q, sc);
    else inputRef.current?.focus();
    // runs once on mount; send() reads the latest state through its own setState calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try { sessionStorage.setItem(convsKey, JSON.stringify(convs.slice(-30))); } catch {}
  }, [convs, convsKey]);

  useEffect(() => { popRef.current = pop; }, [pop]);

  // grow the message box with its text, up to a limit
  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 168) + "px"; }
  }, [text]);

  // keep the newest message in view
  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [cur]);

  // close pop-ups on an outside click; Escape closes a pop-up, then the phone drawer
  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (!(e.target as Element).closest("[data-pop]")) setPop(null); };
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key !== "Escape") return; if (popRef.current) setPop(null); else setDrawer(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const toggle = (p: Exclude<Pop, null>) => setPop(open => (open === p ? null : p));
  const afterNav = () => { if (isNarrow()) setDrawer(false); };
  const hideSide = () => (isNarrow() ? setDrawer(false) : setCollapsed(true));
  const showSide = () => (isNarrow() ? setDrawer(true) : setCollapsed(false));
  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());
  const newConv = () => { setCurId(null); setText(""); setPop(null); focusInput(); };
  const clearCurrent = () => { if (curId) setConvs(prev => prev.filter(c => c.id !== curId)); newConv(); };
  const clearAll = () => { setConvs([]); newConv(); };
  const prefill = (q: string) => {
    setText(q);
    requestAnimationFrame(() => { const el = inputRef.current; if (el) { el.focus(); el.setSelectionRange(q.length, q.length); } });
  };
  const toggleFull = () => {
    const next = !full;
    setFull(next);
    try { sessionStorage.setItem(FULL_KEY, next ? "1" : "0"); } catch {}
  };
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch {}
  };
  async function signOut() {
    try { await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); } catch {}
    try { sessionStorage.removeItem(convsKey); } catch {}
    location.href = "/";
  }

  const onInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const t = performance.now();
    if (t - lastTyped.current > 90) { lastTyped.current = t; rippleFromComposer(.45); }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(text); }
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); void send(text); };
  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter(f => f.size <= MAX_MB * 1048576);
    setFiles(prev => [...prev, ...picked].slice(0, MAX_FILES));
    e.target.value = "";
    focusInput();
  };

  return (
    <div className="grid h-dvh place-items-center overflow-hidden bg-[radial-gradient(1100px_520px_at_50%_-8%,#FFFFFF,transparent),linear-gradient(180deg,#E3EBF8,#CCDDF1)]">
    <div className={`relative grid h-dvh w-full overflow-hidden bg-white transition-[width,height,border-radius,grid-template-columns] duration-[350ms] ease-[cubic-bezier(.16,1,.3,1)] ${collapsed ? "md:grid-cols-[0px_minmax(0,1fr)]" : "md:grid-cols-[252px_minmax(0,1fr)]"} ${full ? "" : "md:h-[min(760px,calc(100dvh-32px))] md:w-[min(1120px,calc(100%-32px))] md:rounded-2xl md:border md:border-brand-200 md:shadow-[0_40px_90px_-40px_#1F273F]"}`}>
      {/* ---------- Sidebar ---------- */}
      <aside
        id="va-side"
        aria-label="Assistant navigation"
        className={`flex min-w-0 flex-col gap-1 overflow-x-hidden overflow-y-auto border-r border-brand-200 bg-brand-100 px-3 pt-4 pb-3.5 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-[min(290px,84%)] max-md:transition-transform max-md:duration-300 ${drawer ? "max-md:translate-x-0 max-md:shadow-[20px_0_40px_-30px_#1F273F]" : "max-md:-translate-x-[102%]"} ${collapsed ? "md:invisible" : ""}`}
      >
        <div className="flex items-center justify-between px-1.5 pt-0.5 pb-2.5">
          <a href="/" title="Verisavo home" className="text-[19px] leading-none font-bold tracking-[-0.02em] text-ink no-underline">{"Verisavo"}</a>
          <button type="button" className="ib" onClick={hideSide} aria-label="Hide sidebar"><I.Panel /></button>
        </div>

        <button type="button" onClick={() => { newConv(); afterNav(); }} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-brand-200 px-3 py-2.5 text-left text-[15px] leading-none font-semibold text-ink hover:bg-brand-300">
          <I.Plus className="box-content size-4 rounded-full bg-ink p-[3px] text-white [stroke-width:2]" />
          <span>{"New question"}</span>
        </button>

        <ul className="m-0 grid list-none gap-0.5 p-0">
          <li>
            <button type="button" className={navBtn} aria-expanded={searchOpen} aria-controls="va-search" onClick={() => { setSearchOpen(o => !o); setQuery(""); }}>
              <I.Search /><span>{"Search"}</span>
            </button>
          </li>
          <li>
            <button type="button" aria-disabled="true" className={`${navBtn} cursor-default text-brand-400 select-none hover:bg-transparent`}>
              <I.Pin /><span>{"SavoScouts"}</span>
              <em className="ml-auto rounded-md bg-white px-[7px] py-[3px] text-[11px] leading-none font-medium whitespace-nowrap text-brand-600 not-italic">{"Coming soon"}</em>
            </button>
          </li>
        </ul>

        {searchOpen && (
          <div id="va-search" className="px-1.5 pt-0.5 pb-1">
            <input type="search" autoFocus autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your questions" aria-label="Search your questions"
              className="w-full rounded-lg border border-brand-300 bg-white px-[11px] py-[9px] text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-brand-500" />
          </div>
        )}

        <p className="mx-3 mt-8 mb-1 border-t border-brand-200 pt-4 text-xs leading-none font-semibold text-brand-700">{"Recent"}</p>
        {recent.length ? (
          <ul className="m-0 grid min-w-0 list-none gap-0.5 p-0">
            {recent.map(c => (
              <li key={c.id} className="min-w-0">
                <button type="button" title={c.title} aria-current={c.id === curId ? "true" : undefined} onClick={() => { setCurId(c.id); afterNav(); focusInput(); }}
                  className={`${navBtn} ${c.id === curId ? "bg-brand-200" : ""}`}>
                  <I.Clock /><span className="min-w-0 truncate">{c.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-3 my-0.5 text-[13px] text-brand-600">{convs.length ? "No questions match your search." : "Questions you ask appear here."}</p>
        )}

        <div className="mt-auto flex items-center gap-2.5 border-t border-brand-200 px-1.5 pt-3">
          <span className="grid size-[34px] flex-none place-items-center rounded-full bg-ink text-[13px] font-semibold text-white">{initials(displayName)}</span>
          <span className="grid min-w-0 flex-1 gap-[3px]">
            <b className="truncate text-sm leading-tight font-semibold text-ink">{displayName}</b>
            <small className="text-xs text-brand-700">{"Free plan"}</small>
          </span>
          <div className="relative" data-pop>
            <button type="button" className="ib" aria-haspopup="menu" aria-expanded={pop === "gear"} aria-controls="va-gear-menu" aria-label="Account settings" title="Account settings" onClick={() => toggle("gear")}>
              <I.Gear />
            </button>
            {pop === "gear" && (
              <div id="va-gear-menu" role="menu" className="pop top-auto right-0 bottom-[calc(100%+6px)] left-auto">
                <a role="menuitem" className="pop-item" href="/dashboard">{"Your dashboard"}</a>
                <a role="menuitem" className="pop-item" href="/platform#privacy">{"Privacy Policy"}</a>
                <a role="menuitem" className="pop-item" href="/platform#terms">{"Terms of Service"}</a>
                <button type="button" role="menuitem" className="pop-item" onClick={signOut}>{"Sign out"}</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {drawer && <div className="fixed inset-0 z-30 bg-ink/35 md:hidden" onClick={() => setDrawer(false)} aria-hidden="true" />}

      {/* ---------- Chat ---------- */}
      <section ref={mainRef} aria-label="Verisavo Intelligence Assistant"
        className={`relative isolate flex min-h-0 min-w-0 flex-col transition-colors duration-500 ${dark ? "theme-dark bg-ink" : "bg-white"}`}>
        <DotFloor dark={dark} apiRef={floor} />

        <header className="relative z-10 flex items-center gap-1.5 py-3 pr-3.5 pl-[18px] max-md:px-2 max-md:py-2.5">
          <button type="button" className={`ib ${collapsed ? "" : "md:hidden"}`} onClick={showSide} aria-label="Show sidebar" aria-controls="va-side" aria-expanded={drawer || !collapsed}>
            <I.Menu />
          </button>
          <div className="relative" data-pop>
            <button type="button" onClick={() => toggle("scope")} aria-haspopup="menu" aria-expanded={pop === "scope"} aria-controls="va-scope-menu"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-transparent px-2.5 py-2 text-[15px] leading-none font-medium text-ink hover:bg-brand-100 aria-expanded:bg-brand-100 dark:text-brand-200 dark:hover:bg-[rgba(227,235,248,.1)] dark:hover:text-white dark:aria-expanded:bg-[rgba(227,235,248,.1)] dark:aria-expanded:text-white">
              <span>{scope}</span><I.Chevron className="size-[15px]" />
            </button>
            {pop === "scope" && (
              <ul id="va-scope-menu" role="menu" aria-label="Market scope" className="pop">
                {MARKETS.map(m => (
                  <li key={m}>
                    <button type="button" role="menuitemradio" aria-checked={m === scope} className="pop-item" onClick={() => { setScope(m); setPop(null); focusInput(); }}>{m}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ml-auto flex items-center gap-0.5">
            <button type="button" className="ib" onClick={toggleTheme} aria-pressed={dark}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Switch to light theme" : "Switch to dark theme"}>
              {dark ? <I.Sun /> : <I.Moon />}
            </button>
            <div className="relative" data-pop>
              <button type="button" className="ib text-brand-700 dark:text-brand-200" aria-expanded={pop === "shield"} aria-controls="va-shield-tip" aria-label="Privacy" onClick={() => toggle("shield")}>
                <I.Shield />
              </button>
              {pop === "shield" && (
                <div id="va-shield-tip" className="pop right-0 left-auto block w-[250px] px-3.5 py-3 text-[13px] leading-normal text-brand-800 max-md:w-[230px]">
                  <b className="mb-1 block text-ink">{"Private by default"}</b>
                  {"Your company data stays private, secure and under your control. It is never shared with other customers."}
                </div>
              )}
            </div>
            <button type="button" className="ib" onClick={newConv} aria-label="New question" title="New question"><I.Pencil /></button>
            <div className="relative" data-pop>
              <button type="button" className="ib" aria-haspopup="menu" aria-expanded={pop === "more"} aria-controls="va-more-menu" aria-label="More options" onClick={() => toggle("more")}>
                <I.Dots />
              </button>
              {pop === "more" && (
                <div id="va-more-menu" role="menu" className="pop right-0 left-auto">
                  <button type="button" role="menuitem" className="pop-item" onClick={clearCurrent}>{"Clear this conversation"}</button>
                  <button type="button" role="menuitem" className="pop-item" onClick={clearAll}>{"Clear all recent questions"}</button>
                </div>
              )}
            </div>
            <button type="button" className="ib max-md:hidden" onClick={toggleFull} aria-pressed={full}
              aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen" : "Full screen"}>
              {full ? <I.Shrink /> : <I.Expand />}
            </button>
            <a href="/platform" className="ib" aria-label="Close assistant" title="Close"><I.Close /></a>
          </div>
        </header>

        <div ref={bodyRef} className={`relative z-10 flex min-h-0 flex-col overflow-y-auto px-6 max-md:px-4 ${hasThread ? "flex-1" : "mt-auto flex-none"}`}>
          {hasThread && cur ? (
            <ol aria-live="polite" className="m-0 mx-auto grid w-full max-w-[720px] list-none content-start gap-[18px] p-0 pt-2 pb-6">
              {cur.items.map(it => <Message key={it.id} item={it} />)}
            </ol>
          ) : (
            <div className="pb-7 text-center">
              <h1 className="m-0 font-serif text-[clamp(1.75rem,1.3rem+1.4vw,2.375rem)] font-normal tracking-[-0.02em] text-ink dark:text-white">
                {firstName ? `Hello ${firstName}. ` : ""}{"What do you need to understand?"}
              </h1>
            </div>
          )}
        </div>

        <div className={`relative z-10 px-6 max-md:px-3 ${hasThread ? "pb-4 max-md:pb-3" : "mb-auto pb-14"}`}>
          <form ref={formRef} onSubmit={onSubmit} noValidate
            className="mx-auto max-w-[720px] rounded-[26px] border border-brand-300 bg-white shadow-[0_10px_30px_-22px_#3A5292] transition-[border-color,box-shadow] duration-200 focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_var(--color-brand-100),0_10px_30px_-22px_#3A5292] dark:border-[rgba(168,198,232,.3)] dark:bg-[rgba(31,39,63,.75)] dark:shadow-[0_14px_40px_-24px_#000] dark:backdrop-blur-[8px] dark:focus-within:border-brand-500 dark:focus-within:shadow-[0_0_0_3px_rgba(97,140,208,.22),0_14px_40px_-24px_#000]">
            {files.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-1.5 px-3.5 pt-2.5">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg bg-brand-100 py-[5px] pr-1.5 pl-2.5 text-[13px] text-ink dark:bg-[rgba(227,235,248,.1)] dark:text-brand-100">
                    <span className="truncate" title={f.name}>{f.name}</span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => { setFiles(prev => prev.filter((_, k) => k !== i)); focusInput(); }}
                      className="grid size-5 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-brand-700 hover:bg-white dark:text-brand-300 dark:hover:bg-[rgba(227,235,248,.12)]">
                      <I.Close className="size-2.5 [stroke-width:2]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-end gap-1.5 py-2 pr-2 pl-2.5">
              <button type="button" className="ib rounded-full" aria-label="Add images or files" onClick={() => fileRef.current?.click()}><I.Plus /></button>
              <input ref={fileRef} type="file" multiple hidden accept={ACCEPT} onChange={onFiles} />
              <label className="sr-only" htmlFor="va-in">{"Message Verisavo"}</label>
              <textarea id="va-in" ref={inputRef} rows={1} maxLength={1000} value={text} onChange={onInput} onKeyDown={onKeyDown}
                placeholder="Ask about a market, a competitor or a decision"
                className="max-h-[168px] min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-[9px] text-[15px] leading-normal text-ink outline-none placeholder:text-brand-600 max-md:text-base dark:text-white dark:placeholder:text-brand-400" />
              <button type="submit" disabled={!text.trim()} aria-label="Send question"
                className="grid size-[38px] flex-none cursor-pointer place-items-center rounded-full border-0 bg-ink text-white transition-colors disabled:cursor-default disabled:bg-brand-200 disabled:text-brand-600 dark:bg-brand-100 dark:text-ink dark:disabled:bg-[rgba(227,235,248,.12)] dark:disabled:text-brand-400">
                <I.ArrowUp className="[stroke-width:2]" />
              </button>
            </div>
          </form>

          {!hasThread && (
            <div className="mx-auto mt-3.5 flex max-w-[720px] flex-wrap justify-center gap-2 max-md:-mx-3 max-md:flex-nowrap max-md:justify-start max-md:overflow-x-auto max-md:px-3 max-md:[scrollbar-width:none]">
              {[...CHIPS, ...(moreChips ? MORE_CHIPS : [])].map(c => (
                <button key={c.label} type="button" onClick={() => prefill(c.q)}
                  className="flex-none cursor-pointer rounded-[10px] border border-brand-200 bg-white px-3.5 py-2.5 text-sm leading-none font-medium text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-100 dark:border-[rgba(168,198,232,.25)] dark:bg-[rgba(31,39,63,.55)] dark:text-brand-200 dark:hover:border-[rgba(168,198,232,.5)] dark:hover:bg-[rgba(227,235,248,.08)]">
                  {c.label}
                </button>
              ))}
              <button type="button" aria-label="More examples" aria-expanded={moreChips} onClick={() => setMoreChips(v => !v)}
                className="flex-none cursor-pointer rounded-[10px] border border-transparent bg-transparent px-2 py-1.5 text-brand-700 dark:text-brand-200">
                <I.Dots />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
    </div>
  );
}

function Message({ item }: { item: Item }) {
  if (item.role === "u") {
    const meta = [
      item.scope !== MARKETS[0] ? `Scope: ${item.scope}` : "",
      item.files ? `${item.files} ${item.files === 1 ? "file" : "files"} attached` : ""
    ].filter(Boolean).join(" · ");
    return (
      <li className="max-w-[82%] animate-rise justify-self-end rounded-[16px_16px_4px_16px] bg-brand-100 px-4 py-3 text-[15px] leading-[1.55] [overflow-wrap:anywhere] whitespace-pre-wrap text-ink dark:bg-[rgba(168,198,232,.14)] dark:text-brand-100 dark:shadow-[inset_0_0_0_1px_rgba(168,198,232,.12)]">
        {item.text}
        {meta && <span className="mt-1.5 block text-xs text-brand-700 dark:text-brand-300">{meta}</span>}
      </li>
    );
  }
  const tag = "justify-self-start rounded-md bg-brand-100 px-2 py-1 text-[11px] leading-none font-semibold tracking-[.08em] text-brand-700 uppercase dark:bg-[rgba(128,170,220,.16)] dark:text-brand-300";
  const para = "m-0 text-[14.4px] leading-[1.6] whitespace-pre-wrap text-brand-800 dark:text-brand-300";
  return (
    <li data-answer={item.id} className="grid animate-rise grid-cols-[30px_minmax(0,1fr)] gap-3">
      <span aria-hidden="true" className="grid size-[30px] place-items-center rounded-lg bg-ink text-[13px] font-bold text-white dark:bg-brand-100 dark:text-ink">{"V"}</span>
      <div className="grid gap-1.5 rounded-xl border border-brand-200 px-4 py-3.5 dark:border-[rgba(168,198,232,.2)] dark:bg-[rgba(31,39,63,.6)] dark:backdrop-blur-[6px]">
        {item.pending ? (
          <>
            <span className="sr-only">{"Working on it"}</span>
            <span aria-hidden="true" className="inline-flex gap-1 py-1.5">
              {[0, 1, 2].map(i => <i key={i} className="size-1.5 animate-blink rounded-full bg-brand-400" style={{ animationDelay: `${i * .15}s` }} />)}
            </span>
          </>
        ) : item.answer ? (
          <><span className={tag}>{"Answer"}</span><p className={para}>{item.answer}</p></>
        ) : (
          <>
            <span className={tag}>{"Not connected yet"}</span>
            <b className="text-[15px] leading-[1.3] font-semibold text-ink dark:text-white">{item.title}</b>
            <p className={para}>{item.body}</p>
          </>
        )}
      </div>
    </li>
  );
}
