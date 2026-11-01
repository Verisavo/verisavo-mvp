"use client";
// The Verisavo Intelligence Assistant at /assistant (sign-in only), in the design of the original assistant window:
// it opens as a window and the full-screen button switches between window and full screen (remembered for the visit).
// Live (M3): questions go to /api/assistant, answers stream in, conversations are saved on the server and the plan's
// limits are enforced there. Before M3 is released, questions are kept for this browser session and not answered.
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { PLAN, type UsageView } from "@/lib/plan";
import { useConfirm } from "../Confirm";
import DotFloor, { type FloorApi } from "./DotFloor";
import { ACCEPT, CHIPS, HANDOFF_KEY, MARKETS, MAX_FILES, MAX_MB, MORE_CHIPS } from "./data";
import * as I from "./icons";

export type AssistantUser = { id: string; name: string; email: string };
type BlockReason = "free_exhausted" | "period_exhausted" | "feature_requires_subscription";

type UserItem = { id: string; role: "u"; text: string; scope: string; files: string[] };
type AnswerItem = { id: string; role: "a"; pending: boolean; streaming?: boolean; title?: string; body?: string; answer?: string; error?: string; serverId?: string };
// a file picked for the next question: uploaded straight away (live), sent with the question by id
type FilePick = { key: string; name: string; status: "uploading" | "ready" | "error"; id?: string; error?: string };
type Notice = { feature: "uploads" | "pdf" } | { error: string } | null;
type PaywallItem = { id: string; role: "p"; reason: BlockReason; usage: UsageView };
type Item = UserItem | AnswerItem | PaywallItem;
type Conv = { id: string; title: string; items: Item[]; loaded: boolean };
type Pop = "scope" | "more" | "gear" | "shield" | null;
type StoredMessage = { id: string; role: "user" | "assistant"; content: string; market: string | null; files?: string[] };

const CONVS_PREFIX = "verisavo-convs";   // + ":" + user id, so a shared browser never shows someone else's questions
const THEME_KEY = "verisavo-va-theme";
const FULL_KEY = "verisavo-va-full";
const uid = () => crypto.randomUUID();
const initials = (name: string) => name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "V";
const isNarrow = () => matchMedia("(max-width: 767px)").matches;

// Before M3 is released the assistant says it isn't connected yet, and never makes an answer up
async function previewAnswer(): Promise<Pick<AnswerItem, "title" | "body">> {
  await new Promise(resolve => setTimeout(resolve, 700));
  return {
    title: "Your question is saved",
    body: "The Intelligence Assistant isn’t connected in this preview, so there is no answer yet. Your question stays in Recent for this session."
  };
}

const toItems = (msgs: StoredMessage[]): Item[] => msgs.map(m => (m.role === "user"
  ? { id: m.id, role: "u", text: m.content, scope: m.market ?? MARKETS[0], files: m.files ?? [] }
  : { id: m.id, role: "a", pending: false, answer: m.content, serverId: m.id }));

// M3.7: a PDF of one answer or the whole conversation, saved by the browser; 402 means the plan doesn't include it
async function downloadPdf(conversationId: string, messageId?: string): Promise<"ok" | "paywall" | "error"> {
  try {
    const r = await fetch(`/api/assistant/conversations/${conversationId}/pdf${messageId ? `?message=${messageId}` : ""}`);
    if (r.status === 402) return "paywall";
    if (r.status === 401) { location.href = "/platform#signin"; return "error"; }
    if (!r.ok) return "error";
    const name = /filename="([^"]+)"/.exec(r.headers.get("content-disposition") ?? "")?.[1] ?? "verisavo-report.pdf";
    const url = URL.createObjectURL(await r.blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return "ok";
  } catch {
    return "error";
  }
}

const planLabel = (u: UsageView | null) => !u ? "Free plan"
  : u.plan === "paid" ? `Monthly plan · ${u.remaining} left` : `Free plan · ${u.remaining} of ${u.limit} left`;

// Subscribe: Stripe Checkout once billing is connected; until then the dashboard explains the plan
async function subscribe() {
  try {
    const r = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await r.json().catch(() => null) as { url?: string } | null;
    if (r.ok && data?.url) { location.href = data.url; return; }
  } catch {}
  location.href = "/dashboard#plan";
}

const navBtn = "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-3 py-[9px] text-left text-[14.4px] leading-[1.2] font-medium text-ink no-underline hover:bg-brand-200";

export default function Assistant({ user, live, usage: initialUsage, conversations }:
  { user: AssistantUser; live: boolean; usage: UsageView | null; conversations: { id: string; title: string }[] }) {
  const [full, setFull] = useState(false);              // window or full screen (phones are always full screen)
  // the server lists newest first; the sidebar shows this list reversed
  const [convs, setConvs] = useState<Conv[]>(() => conversations.map(c => ({ ...c, items: [], loaded: false })).reverse());
  const [usage, setUsage] = useState<UsageView | null>(initialUsage);
  const [curId, setCurId] = useState<string | null>(null);
  const [scope, setScope] = useState<string>(MARKETS[0]);
  const [dark, setDark] = useState(true);
  const [pop, setPop] = useState<Pop>(null);
  const [collapsed, setCollapsed] = useState(false);   // desktop: sidebar hidden
  const [drawer, setDrawer] = useState(false);         // phones: sidebar slid in
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FilePick[]>([]);
  const [notice, setNotice] = useState<Notice>(null);   // a paid feature was tried on the free plan
  const uploading = files.some(f => f.status === "uploading");
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
  const hasThread = Boolean(cur && (cur.items.length || !cur.loaded));
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
    if (!question || uploading) return;
    const sc = scopeOverride ?? scope;
    const sending = files.filter(f => f.status === "ready");
    const u: UserItem = { id: uid(), role: "u", text: question, scope: sc, files: sending.map(f => f.name) };
    const a: AnswerItem = { id: uid(), role: "a", pending: true };
    const existing = curId && convs.some(c => c.id === curId) ? curId : null;
    let convId = existing ?? uid();   // a new conversation gets its real id from the server's first line
    setConvs(prev => prev.some(c => c.id === convId)
      ? prev.map(c => (c.id === convId ? { ...c, items: [...c.items, u, a] } : c))
      : [...prev, { id: convId, title: question.length > 60 ? question.slice(0, 58) + "…" : question, items: [u, a], loaded: true }]);
    setCurId(convId); setText(""); setFiles([]);
    rippleFromComposer(1.4);

    const setAnswer = (patch: Partial<AnswerItem> | ((it: AnswerItem) => Item)) => setConvs(prev => prev.map(c => (c.id !== convId ? c : {
      ...c, items: c.items.map(it => (it.id !== a.id || it.role !== "a" ? it : typeof patch === "function" ? patch(it) : { ...it, ...patch }))
    })));
    const waveFromAnswer = () => requestAnimationFrame(() => {
      const el = document.querySelector(`[data-answer="${a.id}"]`), m = mainRef.current;
      if (el && m) { const r = m.getBoundingClientRect(), b = el.getBoundingClientRect(); ripple(b.left - r.left + 40, b.top - r.top + b.height / 2, .8); }
    });

    if (!live) {
      setAnswer({ pending: false, ...(await previewAnswer()) });
      waveFromAnswer();
      return;
    }

    const fail = (error: string) => setAnswer({ pending: false, streaming: false, error });
    let res: Response;
    try {
      res = await fetch("/api/assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, market: sc, requestId: crypto.randomUUID(), conversationId: existing, attachmentIds: sending.flatMap(f => (f.id ? [f.id] : [])) })
      });
    } catch {
      fail("We couldn’t reach Verisavo. Check your connection and try again.");
      return;
    }
    if (res.status === 401) { location.href = "/platform#signin"; return; }
    if (!(res.headers.get("content-type") ?? "").includes("ndjson")) {
      const data = await res.json().catch(() => null) as { reason?: BlockReason; usage?: UsageView; message?: string } | null;
      if (res.status === 402 && data?.reason && data.usage) {
        const blocked = data.usage;
        setUsage(blocked);
        setAnswer(() => ({ id: a.id, role: "p", reason: data.reason!, usage: blocked }));
      } else if (res.status === 429) fail("You’re asking very quickly. Please wait a minute and try again.");
      else fail(data?.message ?? "The assistant couldn’t answer just now. Please try again.");
      return;
    }

    // the answer streams in as JSON lines: start, delta..., then done or error
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffered = "", started = false;
    const handle = (msg: { type: string; conversationId?: string; remaining?: number; text?: string; message?: string; messageId?: string }) => {
      if (msg.type === "start") {
        if (msg.conversationId && msg.conversationId !== convId) {
          const real = msg.conversationId, temp = convId;
          convId = real;
          setConvs(prev => prev.map(c => (c.id === temp ? { ...c, id: real } : c)));
          setCurId(id => (id === temp ? real : id));
        }
        if (typeof msg.remaining === "number") setUsage(prev => (prev ? { ...prev, remaining: msg.remaining!, used: prev.limit - msg.remaining! } : prev));
      } else if (msg.type === "delta" && msg.text) {
        if (!started) { started = true; waveFromAnswer(); }
        const piece = msg.text;
        setAnswer(it => ({ ...(it as AnswerItem), pending: false, streaming: true, answer: ((it as AnswerItem).answer ?? "") + piece }));
      } else if (msg.type === "done") {
        setAnswer({ streaming: false, serverId: msg.messageId });
      } else if (msg.type === "error") {
        if (typeof msg.remaining === "number") setUsage(prev => (prev ? { ...prev, remaining: msg.remaining!, used: prev.limit - msg.remaining! } : prev));
        fail(msg.message ?? "The assistant couldn’t answer just now. Please try again.");
      }
    };
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffered += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffered.indexOf("\n")) >= 0) {
          const lineText = buffered.slice(0, nl).trim();
          buffered = buffered.slice(nl + 1);
          if (lineText) try { handle(JSON.parse(lineText)); } catch {}
        }
      }
    } catch {
      fail("The connection dropped while the answer was arriving. It will be in this conversation when you reopen it.");
    }
    setAnswer(it => ((it as AnswerItem).pending ? { ...(it as AnswerItem), pending: false, error: "No answer arrived. Please try again." } : { ...(it as AnswerItem), streaming: false }));
  }

  // Opening a saved conversation loads its messages the first time
  async function openConv(id: string) {
    setCurId(id);
    const c = convs.find(x => x.id === id);
    if (!live || !c || c.loaded) return;
    try {
      const r = await fetch(`/api/assistant/conversations/${id}`);
      if (r.status === 401) { location.href = "/platform#signin"; return; }
      const data = r.ok ? await r.json() as { messages: StoredMessage[] } : null;
      setConvs(prev => (data ? prev.map(x => (x.id === id ? { ...x, items: toItems(data.messages), loaded: true } : x)) : prev.filter(x => x.id !== id)));
      if (!data) setCurId(null);
    } catch {
      setConvs(prev => prev.map(x => (x.id === id ? { ...x, loaded: true, items: [{ id: uid(), role: "a", pending: false, error: "This conversation couldn’t be loaded. Check your connection and try again." }] } : x)));
    }
  }

  // First load: theme, conversations (saved on the server when live, else this session's), and a question handed
  // over from the landing page
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try { if (localStorage.getItem(THEME_KEY) === "light") setDark(false); } catch {}
    try { if (sessionStorage.getItem(FULL_KEY) === "1") setFull(true); } catch {}
    try {
      // drop anything another user left in this browser tab (and, once live, this session's preview copy too)
      Object.keys(sessionStorage).filter(k => k.startsWith(CONVS_PREFIX) && (live || k !== convsKey)).forEach(k => sessionStorage.removeItem(k));
      const saved = live ? [] : JSON.parse(sessionStorage.getItem(convsKey) || "[]") as Conv[];
      if (Array.isArray(saved) && saved.length) {
        setConvs(saved.map(c => ({ ...c, loaded: true, items: c.items.map(it => (it.role === "a" && it.pending ? { ...it, pending: false, title: "No answer", body: "This question was interrupted. Please ask it again." } : it)) })));
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
    if (!loaded.current || live) return;
    try { sessionStorage.setItem(convsKey, JSON.stringify(convs.slice(-30))); } catch {}
  }, [convs, convsKey, live]);

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
  const removeOnServer = (path: string) => {
    if (live) void fetch(path, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
  };
  const clearCurrent = () => {
    if (curId) { removeOnServer(`/api/assistant/conversations/${curId}`); setConvs(prev => prev.filter(c => c.id !== curId)); }
    newConv();
  };
  const { confirm, dialog } = useConfirm();
  const clearAll = async () => {
    setPop(null);
    if (live && convs.length && !(await confirm({ title: "Delete all your conversations?", body: "This can’t be undone.", action: "Delete all", danger: true }))) return;
    removeOnServer("/api/assistant/conversations");
    setConvs([]); newConv();
  };
  const deleteOne = async (c: Conv) => {
    if (live && !(await confirm({ title: "Delete this conversation?", body: `“${c.title}” will be deleted. This can’t be undone.`, action: "Delete", danger: true }))) return;
    removeOnServer(`/api/assistant/conversations/${c.id}`);
    setConvs(prev => prev.filter(x => x.id !== c.id));
    if (c.id === curId) newConv();
  };
  const [renaming, setRenaming] = useState<string | null>(null);
  const saveRename = async (c: Conv, value: string) => {
    setRenaming(null);
    const title = value.trim().slice(0, 120);
    if (!title || title === c.title) return;
    const setTitle = (t: string) => setConvs(prev => prev.map(x => (x.id === c.id ? { ...x, title: t } : x)));
    setTitle(title);
    if (!live) return;
    try {
      const r = await fetch(`/api/assistant/conversations/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      if (!r.ok) setTitle(c.title);
    } catch { setTitle(c.title); }
  };
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
  // Files upload as soon as they're picked (one request each, paid plan only); the question sends their ids
  const updatePick = (key: string, patch: Partial<FilePick>) => setFiles(prev => prev.map(f => (f.key === key ? { ...f, ...patch } : f)));
  async function upload(pick: FilePick, file: File) {
    const form = new FormData();
    form.append("file", file);
    try {
      const r = await fetch("/api/assistant/attachments", { method: "POST", body: form });
      const data = await r.json().catch(() => null) as { attachment?: { id: string }; message?: string; usage?: UsageView } | null;
      if (r.status === 402) {
        if (data?.usage) setUsage(data.usage);
        setFiles(prev => prev.filter(f => f.key !== pick.key));
        setNotice({ feature: "uploads" });
      } else if (r.ok && data?.attachment) updatePick(pick.key, { status: "ready", id: data.attachment.id });
      else updatePick(pick.key, { status: "error", error: data?.message ?? "This file couldn’t be attached." });
    } catch {
      updatePick(pick.key, { status: "error", error: "Upload failed. Check your connection." });
    }
  }
  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const room = MAX_FILES - files.length;
    const picked = Array.from(e.target.files ?? []).slice(0, Math.max(0, room));
    e.target.value = "";
    focusInput();
    if (live && usage?.plan !== "paid") { setNotice({ feature: "uploads" }); return; }
    const picks = picked.map(file => {
      const big = file.size > MAX_MB * 1048576;
      const pick: FilePick = { key: uid(), name: file.name, status: !live ? "ready" : big ? "error" : "uploading", error: big ? `Larger than ${MAX_MB} MB` : undefined };
      return { pick, file, big };
    });
    setFiles(prev => [...prev, ...picks.map(p => p.pick)]);
    if (live) picks.filter(p => !p.big).forEach(p => void upload(p.pick, p.file));
  };
  const removePick = (pick: FilePick) => {
    setFiles(prev => prev.filter(f => f.key !== pick.key));
    if (live && pick.id) void fetch(`/api/assistant/attachments/${pick.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
    focusInput();
  };
  const pdf = async (messageId?: string) => {
    if (!cur) return;
    setPop(null);
    const result = await downloadPdf(cur.id, messageId);
    if (result === "paywall") setNotice({ feature: "pdf" });
    else if (result === "error") setNotice({ error: "The PDF couldn’t be made just now. Please try again." });
  };
  const canPdf = live && Boolean(cur?.items.some(it => it.role === "a" && it.serverId && !it.streaming));

  return (
    <div className="grid h-dvh place-items-center overflow-hidden bg-[radial-gradient(1100px_520px_at_50%_-8%,#FFFFFF,transparent),linear-gradient(180deg,#E3EBF8,#CCDDF1)]">
    <div className={`relative grid h-dvh w-full overflow-hidden bg-white transition-[width,height,border-radius,grid-template-columns] duration-[350ms] ease-[cubic-bezier(.16,1,.3,1)] ${collapsed ? "md:grid-cols-[0px_minmax(0,1fr)]" : "md:grid-cols-[252px_minmax(0,1fr)]"} ${full ? "" : "md:h-[min(760px,calc(100dvh-32px))] md:w-[min(1120px,calc(100%-32px))] md:rounded-2xl md:border md:border-brand-200 md:shadow-[0_40px_90px_-40px_#1F273F]"}`}>
      {dialog}
      {/* ---------- Sidebar ---------- */}
      <aside
        id="va-side"
        aria-label="Assistant navigation"
        className={`flex min-w-0 flex-col gap-1 overflow-hidden border-r border-brand-200 bg-brand-100 px-3 pt-4 pb-3.5 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-[min(290px,84%)] max-md:transition-transform max-md:duration-300 ${drawer ? "max-md:translate-x-0 max-md:shadow-[20px_0_40px_-30px_#1F273F]" : "max-md:-translate-x-[102%]"} ${collapsed ? "md:invisible" : ""}`}
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
          // only the list scrolls, with its scrollbar hidden: the buttons above and the account row below stay put
          <ul className="m-0 grid min-h-0 min-w-0 flex-1 list-none content-start gap-0.5 overflow-x-hidden overflow-y-auto p-0 [scrollbar-width:none] [&_button:focus-visible]:outline-offset-[-2px] [&::-webkit-scrollbar]:hidden">
            {recent.map(c => (
              <li key={c.id} className="group relative min-w-0">
                {renaming === c.id ? (
                  <input autoFocus defaultValue={c.title} maxLength={120} aria-label="Conversation title" onFocus={e => e.currentTarget.select()}
                    onBlur={e => void saveRename(c, e.currentTarget.value)}
                    onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { e.currentTarget.value = c.title; e.currentTarget.blur(); } }}
                    className="w-full rounded-lg border border-brand-500 bg-white px-3 py-[8px] text-[14.4px] leading-[1.2] font-medium text-ink focus:outline-none" />
                ) : (
                  <>
                    <button type="button" title={c.title} aria-current={c.id === curId ? "true" : undefined} onClick={() => { void openConv(c.id); afterNav(); focusInput(); }}
                      className={`${navBtn} group-focus-within:pr-[3.75rem] group-hover:bg-brand-200 group-hover:pr-[3.75rem] max-md:pr-[3.75rem] ${c.id === curId ? "bg-brand-200" : ""}`}>
                      <I.Clock /><span className="min-w-0 truncate">{c.title}</span>
                    </button>
                    <span className="absolute inset-y-0 right-1 flex items-center gap-0.5 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                      <button type="button" className="grid size-6 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-brand-800 hover:bg-brand-300 hover:text-ink" aria-label={`Rename “${c.title}”`} title="Rename" onClick={() => setRenaming(c.id)}><I.Pencil className="size-3.5" /></button>
                      <button type="button" className="grid size-6 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-brand-800 hover:bg-[#FEE4E2] hover:text-danger" aria-label={`Delete “${c.title}”`} title="Delete" onClick={() => void deleteOne(c)}><I.Trash className="size-3.5" /></button>
                    </span>
                  </>
                )}
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
            <small className="text-xs text-brand-700">{planLabel(usage)}</small>
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
                  {canPdf && <button type="button" role="menuitem" className="pop-item" onClick={() => void pdf()}>{"Download conversation as PDF"}</button>}
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
            <ol aria-live="polite" aria-busy={!cur.loaded} className="m-0 mx-auto grid w-full max-w-[720px] list-none content-start gap-[18px] p-0 pt-2 pb-6">
              {cur.loaded ? cur.items.map(it => <Message key={it.id} item={it} onPdf={live ? pdf : undefined} />) : <Message item={{ id: "loading", role: "a", pending: true }} />}
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
          {notice && <NoticeCard notice={notice} onClose={() => setNotice(null)} />}
          <form ref={formRef} onSubmit={onSubmit} noValidate
            className="mx-auto max-w-[720px] rounded-[26px] border border-brand-300 bg-white shadow-[0_10px_30px_-22px_#3A5292] transition-[border-color,box-shadow] duration-200 focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_var(--color-brand-100),0_10px_30px_-22px_#3A5292] dark:border-[rgba(168,198,232,.3)] dark:bg-[rgba(31,39,63,.75)] dark:shadow-[0_14px_40px_-24px_#000] dark:backdrop-blur-[8px] dark:focus-within:border-brand-500 dark:focus-within:shadow-[0_0_0_3px_rgba(97,140,208,.22),0_14px_40px_-24px_#000]">
            {files.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-1.5 px-3.5 pt-2.5">
                {files.map(f => (
                  <li key={f.key} title={f.error ? `${f.name}: ${f.error}` : f.name}
                    className={`inline-flex max-w-[260px] items-center gap-1.5 rounded-lg py-[5px] pr-1.5 pl-2.5 text-[13px] ${f.status === "error" ? "bg-[#FEF3F2] text-danger dark:bg-[rgba(240,68,56,.15)] dark:text-[#FDA29B]" : "bg-brand-100 text-ink dark:bg-[rgba(227,235,248,.1)] dark:text-brand-100"}`}>
                    {f.status === "uploading" && <span aria-hidden="true" className="size-2 flex-none animate-blink rounded-full bg-brand-500" />}
                    <span className="truncate">{f.name}</span>
                    {f.status === "uploading" && <span className="sr-only">{"uploading"}</span>}
                    {f.status === "error" && <span className="flex-none text-[12px] whitespace-nowrap">{f.error && f.error.length < 24 ? f.error : "can’t attach"}</span>}
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => removePick(f)}
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
              <button type="submit" disabled={!text.trim() || uploading} aria-label={uploading ? "Waiting for files to upload" : "Send question"}
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

function Message({ item, onPdf }: { item: Item; onPdf?: (messageId: string) => void }) {
  if (item.role === "u") {
    const meta = [
      item.scope !== MARKETS[0] ? `Scope: ${item.scope}` : "",
      item.files.length ? `Attached: ${item.files.join(", ")}` : ""
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
  const title = "text-[15px] leading-[1.3] font-semibold text-ink dark:text-white";
  if (item.role === "p") return <Paywall item={item} tag={tag} para={para} title={title} />;
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
        ) : item.error ? (
          <>
            {item.answer && <p className={para}>{item.answer}</p>}
            <span className={`${tag} bg-[#FEF3F2] text-danger dark:bg-[rgba(240,68,56,.15)] dark:text-[#FDA29B]`}>{"Couldn’t answer"}</span>
            <p className={para}>{item.error}</p>
          </>
        ) : item.answer ? (
          <>
            <span className={tag}>{"Answer"}</span>
            <p className={para}>{item.answer}{item.streaming && <span aria-hidden="true" className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-blink bg-brand-500" />}</p>
            {onPdf && item.serverId && !item.streaming && (
              <button type="button" onClick={() => onPdf(item.serverId!)}
                className="mt-1 cursor-pointer justify-self-end rounded-md border-0 bg-transparent px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-[rgba(227,235,248,.08)]">
                {"Download PDF"}
              </button>
            )}
          </>
        ) : (
          <>
            <span className={tag}>{"Not connected yet"}</span>
            <b className={title}>{item.title}</b>
            <p className={para}>{item.body}</p>
          </>
        )}
      </div>
    </li>
  );
}

// Above the message box: a paid feature tried on the free plan (uploads, PDF), or a PDF that couldn't be made
function NoticeCard({ notice, onClose }: { notice: NonNullable<Notice>; onClose: () => void }) {
  const head = "error" in notice ? notice.error
    : notice.feature === "pdf" ? "PDF reports are part of Verisavo Monthly" : "File and image uploads are part of Verisavo Monthly";
  return (
    <div role="status" className="mx-auto mb-2.5 flex max-w-[720px] flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-brand-300 bg-white px-4 py-3 text-sm text-ink shadow-[0_10px_30px_-22px_#3A5292] dark:border-[rgba(168,198,232,.35)] dark:bg-[rgba(31,39,63,.85)] dark:text-brand-100">
      <span className="min-w-0 flex-1">
        <b className="font-semibold">{head}</b>
        {!("error" in notice) && <span className="block text-[13px] text-brand-800 dark:text-brand-300">{`${PLAN.PRICE_TEXT}: ${PLAN.PAID_MESSAGES_PER_PERIOD} messages a month on web and WhatsApp, file uploads and PDF reports.`}</span>}
      </span>
      {!("error" in notice) && <button type="button" onClick={() => void subscribe()} className="cursor-pointer rounded-full border-0 bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-800 dark:bg-brand-100 dark:text-ink">{"Subscribe"}</button>}
      <button type="button" className="ib" aria-label="Close" onClick={onClose}><I.Close className="size-3.5" /></button>
    </div>
  );
}

// The hard stop (M3.4 / M3.5): the server refused the question, so nothing was sent to the model
function Paywall({ item, tag, para, title }: { item: PaywallItem; tag: string; para: string; title: string }) {
  const resets = item.usage.resetsAt ? new Date(item.usage.resetsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : null;
  const copy = item.reason === "period_exhausted"
    ? { head: `You’ve used all ${item.usage.limit} messages this month`, body: resets ? `Your messages reset on ${resets}.` : "Your messages reset when your next billing period starts.", cta: false }
    : item.reason === "feature_requires_subscription"
      ? { head: "File and image uploads are part of Verisavo Monthly", body: `Subscribe for ${PLAN.PRICE_TEXT} to attach files, get ${PLAN.PAID_MESSAGES_PER_PERIOD} messages a month on web and WhatsApp, and download PDF reports. You can also ask without the files.`, cta: true }
      : { head: `You’ve used your ${PLAN.FREE_QUESTIONS} free questions`, body: `Subscribe to Verisavo Monthly for ${PLAN.PRICE_TEXT}: ${PLAN.PAID_MESSAGES_PER_PERIOD} messages a month on web and WhatsApp, file uploads and PDF reports.`, cta: true };
  return (
    <li data-answer={item.id} className="grid animate-rise grid-cols-[30px_minmax(0,1fr)] gap-3">
      <span aria-hidden="true" className="grid size-[30px] place-items-center rounded-lg bg-ink text-[13px] font-bold text-white dark:bg-brand-100 dark:text-ink">{"V"}</span>
      <div className="grid gap-2 rounded-xl border border-brand-300 bg-brand-100/60 px-4 py-3.5 dark:border-[rgba(168,198,232,.35)] dark:bg-[rgba(31,39,63,.75)]">
        <span className={tag}>{item.usage.plan === "paid" ? "Monthly limit reached" : "Free questions used"}</span>
        <b className={title}>{copy.head}</b>
        <p className={para}>{copy.body}</p>
        {copy.cta && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button type="button" onClick={() => void subscribe()} className="cursor-pointer rounded-full border-0 bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-100 dark:text-ink dark:hover:bg-white">{`Subscribe · ${PLAN.PRICE_TEXT}`}</button>
            <a href="/dashboard#plan" className="text-sm font-semibold text-brand-700 dark:text-brand-200">{"See your plan"}</a>
          </div>
        )}
      </div>
    </li>
  );
}
