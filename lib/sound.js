/* Verisavo sound
   A living ambient score for the site, synthesised in the browser with the Web Audio API (no audio files).

   Layers
   - Pad: a slow, wide chord that changes with each chapter or section.
   - Pulses: soft plucked notes drawn from the current chord. Busier sections play more of them; scrolling quickens them.
   - Drone and sub: a low foundation that deepens when the menu, a page or a pop-up covers the scene (as on the reference site).
   - Air: filtered noise that rises with scroll speed and brightens the pad.
   Cues
   - Chapter change: a short breath, a soft riser, a "decoding" shimmer of tiny ticks, then a chime.
   - Clicks and hovers: a crisp ~10 ms tick matched to the reference recording.
   - Typing: a keyboard keystroke for every key typed in a field (space, enter and backspace each sound different), and lighter keys for the self-typing examples.
   - Send, answer, success and error moments in forms and the assistant.

   Sound starts muted. A speaker button ([data-sound-toggle]) turns it on or off; the choice is remembered when the browser allows. */
export default function init() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const toggles = () => document.querySelectorAll("[data-sound-toggle]");
  if (!AC) { toggles().forEach(b => b.hidden = true); return; }

  let ctx = null, master, comp, verb, verbIn, music, musicTone, padBus, airGain, airFilter, drone, droneGain, sub, subGain, clickBus, keyBus, pulseBus;
  // Music per place on the site. Each track loads the first time its place is visited with sound on.
  // - home: "Elsweyr Beat" (Joseph Beg), looped on a bar boundary, for the homepage story
  // - about: a remix of "I'm Yours" (Xack) with the drums and bass removed, for the About us page
  // Everywhere else (other pages, the Platform page) the synthesised score plays.
  const TRACKS = {
    home:  { url: "/home-music.mp3", root: 74, chime: [78, 81, 83, 86, 81, 76, 83, 81, 86, 78] },   // D major
    about: { url: "/bg-music.mp3",  root: 72, chime: [76, 79, 81, 84, 79, 74, 81, 79, 84, 76] }    // C major / A minor
  };
  let mode = "synth", scene = "synth", padOut = null;
  const isAbout = () => { const el = document.getElementById("pg-about-us"); return !!(el && el.classList.contains("open")); };
  const isHome = () => !!document.getElementById("gl") && !document.querySelector(".pg.open");
  const where = () => isAbout() ? "about" : isHome() ? "home" : "synth";
  let on = false, wanted = false, chord = -1, pad = [], airTarget = 0, airNow = 0, covered = 0;
  wanted = true;   // sound is on unless the visitor has turned it off
  try { wanted = localStorage.getItem("verisavo-sound") !== "off"; } catch (e) {}

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const now = () => ctx ? ctx.currentTime : 0;
  const R = (a, b) => a + Math.random() * (b - a);

  // One voicing per chapter (C-major family): calm at the start, open and unresolved at the Intelligence Gap, resolved at the decision
  const CHORDS = [
    [48, 55, 62, 64],      // 0 Cmaj9: opening
    [45, 52, 59, 60],      // 1 Am9: signals
    [41, 53, 57, 64],      // 2 Fmaj7: evidence
    [43, 50, 57, 59],      // 3 G6/9: connection
    [40, 52, 55, 62],      // 4 Em7: understanding
    [38, 50, 57, 64],      // 5 Dsus: intelligence gap
    [45, 57, 59, 64],      // 6 Am(add9): Ground-Level Intelligence
    [43, 55, 60, 62],      // 7 Gsus: market memory
    [48, 55, 62, 64, 71],  // 8 Cmaj9 with a high B: decision
    [48, 55, 60, 64]       // 9 C: close
  ];
  // how busy the pulse layer is per chapter (notes per second): sparse at the gap, fullest where evidence connects
  const DENSITY = [.35, .7, .9, 1.4, 1.1, .22, .8, 1.05, 1.5, .5];


  /* ---------- buffers ---------- */
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function noiseBuffer(sec) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    return b;
  }
  function whiteBuffer(sec) {
    const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  let NOISE = null, WHITE = null, CLICK = null;
  // crisp ~10 ms tick: sub-millisecond attack, fast decay, energy mostly 4.5-12 kHz (matched to the reference recording)
  function clickBuffer() {
    const sr = ctx.sampleRate, len = Math.floor(sr * .03), b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0);
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
    for (let i = 0; i < len; i++) {
      const t = i / sr, env = Math.exp(-t / .0036), ring = Math.exp(-t / .0024);
      d[i] = rnd() * env * .75 + Math.sin(2 * Math.PI * 5600 * t) * ring * .35 + Math.sin(2 * Math.PI * 9200 * t) * ring * .16 + Math.sin(2 * Math.PI * 2500 * t) * ring * .22;
    }
    for (let i = 0; i < 12; i++) d[i] *= i / 12;
    return b;
  }

  /* ---------- graph ---------- */
  function build() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = .005; comp.release.value = .2;
    master.connect(comp); comp.connect(ctx.destination);

    verb = ctx.createConvolver(); verb.buffer = impulse(3.4, 2.5);
    verbIn = ctx.createGain(); verbIn.gain.value = .9;
    const pre = ctx.createDelay(.2); pre.delayTime.value = .028; verbIn.connect(pre); pre.connect(verb);
    const verbOut = ctx.createGain(); verbOut.gain.value = .8; verb.connect(verbOut); verbOut.connect(master);

    // music bus: everything tonal goes through here, so covering the scene can darken and duck it in one place
    musicTone = ctx.createBiquadFilter(); musicTone.type = "lowpass"; musicTone.frequency.value = 16000; musicTone.Q.value = .5;
    music = ctx.createGain(); music.gain.value = 1;
    musicTone.connect(music); music.connect(master);

    padBus = ctx.createBiquadFilter(); padBus.type = "lowpass"; padBus.frequency.value = 1000; padBus.Q.value = .4;
    padOut = ctx.createGain(); padOut.gain.value = .85; padBus.connect(padOut); padOut.connect(musicTone);
    const padSend = ctx.createGain(); padSend.gain.value = .5; padBus.connect(padSend); padSend.connect(verbIn);
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = .05; lfoG.gain.value = 240; lfo.connect(lfoG); lfoG.connect(padBus.frequency); lfo.start();

    // pulses go through a soft stereo echo
    pulseBus = ctx.createGain(); pulseBus.gain.value = 1; pulseBus.connect(musicTone);
    const dl = ctx.createDelay(1), dr = ctx.createDelay(1), fb = ctx.createGain(), dlp = ctx.createBiquadFilter(), echo = ctx.createGain();
    dl.delayTime.value = .375; dr.delayTime.value = .5; fb.gain.value = .32; dlp.type = "lowpass"; dlp.frequency.value = 2400; echo.gain.value = .35;
    pulseBus.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dr); dr.connect(dl);
    if (ctx.createStereoPanner) { const pl = ctx.createStereoPanner(), pr = ctx.createStereoPanner(); pl.pan.value = -.6; pr.pan.value = .6; dl.connect(pl); dr.connect(pr); pl.connect(echo); pr.connect(echo); }
    else { dl.connect(echo); dr.connect(echo); }
    echo.connect(musicTone); const ps = ctx.createGain(); ps.gain.value = .35; pulseBus.connect(ps); ps.connect(verbIn);

    // drone, plus a sub that comes forward when the scene is covered
    drone = ctx.createOscillator(); drone.type = "sine"; drone.frequency.value = mtof(36);
    droneGain = ctx.createGain(); droneGain.gain.value = .08; drone.connect(droneGain); droneGain.connect(master); drone.start();
    sub = ctx.createOscillator(); sub.type = "triangle"; sub.frequency.value = mtof(43 - 12);
    const subLp = ctx.createBiquadFilter(); subLp.type = "lowpass"; subLp.frequency.value = 160;
    subGain = ctx.createGain(); subGain.gain.value = 0; sub.connect(subLp); subLp.connect(subGain); subGain.connect(master); sub.start();

    NOISE = noiseBuffer(4); WHITE = whiteBuffer(1); CLICK = clickBuffer();
    clickBus = ctx.createBiquadFilter(); clickBus.type = "highpass"; clickBus.frequency.value = 1300;
    const clickLp = ctx.createBiquadFilter(); clickLp.type = "lowpass"; clickLp.frequency.value = 9500; clickLp.Q.value = .6;
    const clickTone = ctx.createBiquadFilter(); clickTone.type = "peaking"; clickTone.frequency.value = 6500; clickTone.gain.value = 4; clickTone.Q.value = .8;
    clickBus.connect(clickLp); clickLp.connect(clickTone); clickTone.connect(master); const cs = ctx.createGain(); cs.gain.value = .06; clickTone.connect(cs); cs.connect(verbIn);
    keyBus = ctx.createGain(); keyBus.gain.value = 1; keyBus.connect(master); const ks = ctx.createGain(); ks.gain.value = .05; keyBus.connect(ks); ks.connect(verbIn);

    const air = ctx.createBufferSource(); air.buffer = NOISE; air.loop = true;
    airFilter = ctx.createBiquadFilter(); airFilter.type = "bandpass"; airFilter.frequency.value = 900; airFilter.Q.value = .6;
    airGain = ctx.createGain(); airGain.gain.value = .022;
    air.connect(airFilter); airFilter.connect(airGain); airGain.connect(master); air.start();

    Object.values(TRACKS).forEach(tr => { tr.gain = ctx.createGain(); tr.gain.gain.value = 0; tr.gain.connect(musicTone); const ts = ctx.createGain(); ts.gain.value = .12; tr.gain.connect(ts); ts.connect(verbIn); });
    setChord(Math.max(0, chord), true);
    nextPulse = now() + .8;
    requestAnimationFrame(loop);
  }

  /* ---------- background tracks ---------- */
  let saved = {}; try { saved = JSON.parse(sessionStorage.getItem("verisavo-track-pos") || "{}") || {}; } catch (e) {}
  // MP3 files carry a little silent padding at each end; skip it so the loop is seamless
  function edges(buf) {
    const d = buf.getChannelData(0), th = .0008; let s = 0, e = d.length - 1;
    while (s < d.length && Math.abs(d[s]) < th) s++;
    while (e > s && Math.abs(d[e]) < th) e--;
    return [Math.min(s, buf.sampleRate * .2) / buf.sampleRate, Math.max(e, d.length - buf.sampleRate * .2) / buf.sampleRate];
  }
  async function loadTrack(key) {
    const tr = TRACKS[key]; if (tr.loading || tr.buf) return; tr.loading = true;
    const mine = ctx;
    try {
      const res = await fetch(tr.url); if (!res.ok) throw new Error(res.status);
      const data = await res.arrayBuffer();
      const buf = await new Promise((ok, bad) => { const p = mine.decodeAudioData(data, ok, bad); if (p && p.then) p.then(ok, bad); });
      if (ctx !== mine) { tr.loading = false; return; }   // the audio was rebuilt meanwhile; the new one loads its own copy
      tr.buf = buf;
      const [ls, le] = edges(tr.buf);
      tr.src = ctx.createBufferSource(); tr.src.buffer = tr.buf; tr.src.loop = true; tr.src.loopStart = ls; tr.src.loopEnd = le; tr.src.connect(tr.gain);
      tr.len = le - ls; tr.ls = ls;
      const off = ls + ((saved[key] || 0) % tr.len); tr.start = now() - (off - ls); tr.src.start(now(), off);
      setScene(where());
    } catch (e) { tr.loading = false; }   // the synthesised score simply carries on
  }
  // crossfade between the synthesised score and the track for the current place
  function setScene(s) {
    scene = s;
    if (!ctx) return;
    if (s !== "synth" && !TRACKS[s].buf) { loadTrack(s); }
    mode = s !== "synth" && TRACKS[s].buf ? s : "synth";
    const t = now(), toTrack = mode !== "synth";
    const ramp = (g, v, d) => { g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(v, t + d); };
    Object.entries(TRACKS).forEach(([k, tr]) => { if (tr.gain) ramp(tr.gain.gain, k === mode ? .85 : 0, k === mode ? 3 : 1.6); });
    ramp(padOut.gain, toTrack ? 0 : .85, toTrack ? 1.6 : 3);
    ramp(droneGain.gain, toTrack ? 0 : .08, 2);
    setCovered(coverCount());
  }
  // continue from the same place when moving between pages
  addEventListener("pagehide", () => {
    if (!ctx) return; const out = Object.assign({}, saved);
    Object.entries(TRACKS).forEach(([k, tr]) => { if (tr.buf) out[k] = (now() - tr.start) % tr.len; });
    try { sessionStorage.setItem("verisavo-track-pos", JSON.stringify(out)); } catch (e) {}
  });

  /* ---------- pad and chords ---------- */
  function setChord(i, instant) {
    i = Math.max(0, Math.min(CHORDS.length - 1, i));
    if (!ctx || mode !== "synth") { chord = i; return; }
    if (i === chord && pad.length) return;
    chord = i;
    const t = now(), fade = instant ? 1.5 : 3.2;
    pad.forEach(v => { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + fade); v.o.forEach(o => o.stop(t + fade + .1)); });
    pad = CHORDS[i].map((m, k) => {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(padBus);
      const lvl = (k === 0 ? .12 : .08) * (m > 66 ? .6 : 1);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + fade + .4);
      const o = [["sine", 0, 0, .55], ["triangle", 7, -.55, .28], ["triangle", -7, .55, .28], ["sine", -1200, 0, .12]].map(([type, cents, pan, amp]) => {
        const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = mtof(m); osc.detune.value = cents;
        const og = ctx.createGain(); og.gain.value = amp; osc.connect(og);
        if (ctx.createStereoPanner && pan) { const pn = ctx.createStereoPanner(); pn.pan.value = pan; og.connect(pn); pn.connect(g); } else og.connect(g);
        osc.start(t); return osc;
      });
      return { g, o };
    });
    const root = CHORDS[i][0];
    [[drone, root - 12], [sub, root - 24 + (root < 43 ? 12 : 0)]].forEach(([o, m]) => { o.frequency.cancelScheduledValues(t); o.frequency.setValueAtTime(o.frequency.value, t); o.frequency.exponentialRampToValueAtTime(mtof(m), t + fade); });
  }

  /* ---------- pulses: the moving layer ---------- */
  let nextPulse = 0, lastNote = -1;
  function pluck(m, t, vol, pan) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), dec = R(.7, 1.4);
    o.type = "triangle"; o2.type = "sine"; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 2; o2.detune.value = R(-4, 4);
    const g2 = ctx.createGain(); g2.gain.value = .25; o2.connect(g2); g2.connect(f);
    f.type = "lowpass"; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(700, t + dec);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dec);
    o.connect(f); f.connect(g);
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(pulseBus); } else g.connect(pulseBus);
    o.start(t); o2.start(t); o.stop(t + dec + .05); o2.stop(t + dec + .05);
  }
  function schedulePulses() {
    if (!on || covered || mode !== "synth") { nextPulse = Math.max(nextPulse, now() + .3); return; }
    const rate = DENSITY[Math.max(0, chord)] * (1 + airNow * 1.6);
    while (nextPulse < now() + .12) {
      const notes = CHORDS[Math.max(0, chord)];
      let m; do { m = notes[Math.floor(Math.random() * notes.length)] + (Math.random() < .55 ? 12 : 24); } while (m === lastNote && notes.length > 1);
      if (m > 86) m -= 12;
      lastNote = m;
      pluck(m, nextPulse, R(.018, .032), R(-.7, .7));
      // gentle swing: mostly on an eighth-note grid at ~76 bpm, with some longer gaps
      const step = .395;
      nextPulse += step * Math.max(1, Math.round(R(.6, 2.4) / Math.max(rate, .15)));
    }
  }

  /* ---------- one-shot cues ---------- */
  function bell(m, vol, when, len) {
    if (!on || !ctx) return;
    const t = now() + (when || 0), L = len || 2.6, g = ctx.createGain(); g.gain.value = 0;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + L);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200; g.connect(lp);
    [[1, 1, L], [2, .16, L * .5], [3.01, .05, L * .3], [4.2, .025, .25]].forEach(([r, amp, d]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = mtof(m) * r;
      const og = ctx.createGain(); og.gain.setValueAtTime(amp, t); og.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(og); og.connect(g); o.start(t); o.stop(t + d + .05);
    });
    const dry = ctx.createGain(); dry.gain.value = .55; lp.connect(dry); dry.connect(master); lp.connect(verbIn);
  }
  let lastClick = 0;
  function click(vol, rate, when) {
    if (!on || !CLICK) return;
    const t = now() + (when || 0); if (!when && t - lastClick < .035) return; if (!when) lastClick = t;
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = CLICK; s.playbackRate.value = (rate || 1) * R(.97, 1.03);
    g.gain.value = vol; s.connect(g); g.connect(clickBus); s.start(t);
  }
  function whoosh(up, vol, len) {
    if (!on || !NOISE) return;
    const t = now(), L = len || .9, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = NOISE; f.type = "bandpass"; f.Q.value = 1.1;
    f.frequency.setValueAtTime(up ? 350 : 1800, t); f.frequency.exponentialRampToValueAtTime(up ? 2200 : 300, t + L * .8);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .09, t + L * .3); g.gain.exponentialRampToValueAtTime(.0001, t + L);
    s.connect(f); f.connect(g); g.connect(master); g.connect(verbIn); s.start(t, Math.random() * 2, L + .1);
  }
  // "decoding": a quick scatter of tiny high ticks, like text resolving
  function shimmer(n, vol) {
    if (!on) return;
    for (let i = 0; i < (n || 9); i++) click((vol || .03) * R(.5, 1), R(1.2, 1.8), .02 + i * R(.028, .05));
  }
  // short breath in the music before a change
  function breathe() {
    if (!on || !ctx) return;
    const t = now(); music.gain.cancelScheduledValues(t); music.gain.setValueAtTime(music.gain.value, t);
    music.gain.linearRampToValueAtTime(covered ? .55 : .5, t + .25); music.gain.linearRampToValueAtTime(covered ? .7 : 1, t + 1.6);
  }
  function arp(notes, vol, gap) { notes.forEach((m, i) => bell(m, vol, i * (gap || .09), 2)); }

  /* ---------- keyboard ---------- */
  // a soft mechanical key: a low "thock" from the keycap, the crisp switch click, and a faint release
  function key(kind, soft) {
    if (!on || !CLICK) return;
    const t = now(), v = soft ? .45 : 1;
    const big = kind === "space" || kind === "enter", back = kind === "back";
    // thock
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = "sine"; const f0 = big ? R(150, 170) : back ? R(260, 290) : R(205, 245);
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .62, t + .035);
    og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime((big ? .1 : .07) * v, t + .002); og.gain.exponentialRampToValueAtTime(.0001, t + (big ? .07 : .045));
    o.connect(og); og.connect(keyBus); o.start(t); o.stop(t + .1);
    // body noise
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), ng = ctx.createGain();
    s.buffer = WHITE; f.type = "bandpass"; f.frequency.value = big ? R(900, 1100) : R(1500, 2100); f.Q.value = 1.4;
    ng.gain.setValueAtTime((big ? .1 : .075) * v, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .03);
    s.connect(f); f.connect(ng); ng.connect(keyBus); s.start(t, Math.random() * .8, .05);
    // switch click and release
    const c = ctx.createBufferSource(), cg = ctx.createGain(); c.buffer = CLICK; c.playbackRate.value = big ? R(.55, .62) : back ? R(.85, .95) : R(.68, .8);
    cg.gain.value = .07 * v; c.connect(cg); cg.connect(clickBus); c.start(t);
    const r = ctx.createBufferSource(), rg = ctx.createGain(); r.buffer = CLICK; r.playbackRate.value = R(1.05, 1.25);
    rg.gain.value = .022 * v; r.connect(rg); rg.connect(clickBus); r.start(t + R(.06, .09));
  }
  const typable = el => el && (el.tagName === "TEXTAREA" || el.isContentEditable || (el.tagName === "INPUT" && /^(text|email|tel|search|url|number|password|)$/i.test(el.type || "")));
  document.addEventListener("keydown", e => {
    if (!on || !typable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.repeat && Math.random() < .5) return;
    const k = e.key;
    if (k === " ") key("space"); else if (k === "Enter") key("enter"); else if (k === "Backspace" || k === "Delete") key("back");
    else if (k.length === 1) key("char"); else if (/^Arrow/.test(k)) click(.03, 1.3);
  }, true);

  /* ---------- scroll ---------- */
  let lastY = scrollY, lastT = performance.now(), scrollers = new WeakMap();
  function feed(dy, dt) { const v = Math.min(1, Math.abs(dy) / Math.max(dt, 8) / 4); airTarget = Math.max(airTarget, v); }
  addEventListener("scroll", () => { const t = performance.now(); feed(scrollY - lastY, t - lastT); lastY = scrollY; lastT = t; }, { passive: true });
  document.addEventListener("scroll", e => { const el = e.target; if (!(el instanceof Element)) return; const p = scrollers.get(el) || { y: el.scrollTop, t: performance.now() }, t = performance.now(); feed(el.scrollTop - p.y, t - p.t); scrollers.set(el, { y: el.scrollTop, t }); }, { capture: true, passive: true });

  function loop() {
    if (!ctx) return;
    airTarget *= .9; airNow += (airTarget - airNow) * .12;
    if (on) {
      const t = now();
      airGain.gain.setTargetAtTime(.022 + airNow * .12, t, .08);
      airFilter.frequency.setTargetAtTime(700 + airNow * 2200, t, .1);
      padBus.frequency.setTargetAtTime((covered ? 520 : 1000) + airNow * 1500, t, .25);   // scrolling brightens the pad
      musicTone.frequency.setTargetAtTime(covered ? 1500 : (mode !== "synth" ? 6500 + airNow * 9500 : 16000), t, covered ? .35 : .25);   // and the track
      if (scene !== where()) setScene(where());
      schedulePulses();
    }
    requestAnimationFrame(loop);
  }

  /* ---------- covered scene (menu, pages, pop-ups): darker and deeper, as on the reference site ---------- */
  function setCovered(n) {
    covered = Math.max(0, n);
    if (!ctx) return;
    const t = now(), c = covered > 0;
    music.gain.cancelScheduledValues(t); music.gain.setValueAtTime(music.gain.value, t); music.gain.linearRampToValueAtTime(c ? .8 : 1, t + 1);
    if (mode !== "synth") return;   // the track has no bass by design, so no sub is added over it
    subGain.gain.cancelScheduledValues(t); subGain.gain.setValueAtTime(subGain.gain.value, t); subGain.gain.linearRampToValueAtTime(c ? .075 : 0, t + 1.2);
    droneGain.gain.cancelScheduledValues(t); droneGain.gain.setValueAtTime(droneGain.gain.value, t); droneGain.gain.linearRampToValueAtTime(c ? .09 : .08, t + 1.2);
  }
  // About us is its own setting (the track plays clearly there); anything covering it still muffles the sound
  // pages are places, not overlays: only the menu, pop-ups and full-screen detail views soften the music
  const coverCount = () => document.querySelectorAll(".mnav.open, #menu.open, dialog[open]").length + (!isAbout() && document.querySelector(".rs-detail.open") ? 1 : 0);

  /* ---------- on / off ---------- */
  function paint() {
    const waiting = on && !(ctx && ctx.state === "running" && started);
    toggles().forEach(b => { b.setAttribute("aria-pressed", String(on)); const l = !on ? "Turn sound on" : waiting ? "Sound is on. Tap anywhere to continue it" : "Turn sound off"; b.setAttribute("aria-label", l); b.title = l; b.classList.toggle("is-on", on); b.classList.toggle("is-waiting", waiting); });
  }
  // iPhones mute web audio when the side switch is on silent. Playing a silent media element (and asking for the
  // "playback" audio session where supported) lets the sound play like any other media the visitor starts.
  let unlockEl = null;
  function silentWav() {
    const n = 800, b = new Uint8Array(44 + n), v = new DataView(b.buffer), s = (o, t) => [...t].forEach((c, i) => b[o + i] = c.charCodeAt(0));
    s(0, "RIFF"); v.setUint32(4, 36 + n, true); s(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); s(36, "data"); v.setUint32(40, n, true); b.fill(128, 44);
    let bin = ""; b.forEach(x => bin += String.fromCharCode(x)); return "data:audio/wav;base64," + btoa(bin);
  }
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    try {
      if (!unlockEl) { unlockEl = document.createElement("audio"); unlockEl.src = silentWav(); unlockEl.loop = true; unlockEl.setAttribute("playsinline", ""); unlockEl.setAttribute("aria-hidden", "true"); unlockEl.preload = "auto"; }
      const p = unlockEl.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
    if (ctx) {
      if (ctx.state !== "running") ctx.resume().catch(() => {});
      const b = ctx.createBuffer(1, 1, ctx.sampleRate), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);   // iOS needs a sound started inside the tap
    }
  }
  let started = false;
  function startAudio(fromGesture) {
    if (!ctx) build();
    if (fromGesture) unlock(); else if (ctx.state !== "running") ctx.resume().catch(() => {});
    if (ctx.state !== "running" && !fromGesture) return;   // wait for the first tap or key
    if (started) return; started = true;
    setCovered(coverCount());
    const t = now(); master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(.9, t + 2.2);
    setScene(where());
  }
  function setOn(v, remember, fromGesture) {
    on = v;
    if (remember) { try { localStorage.setItem("verisavo-sound", v ? "on" : "off"); } catch (e) {} wanted = v; }
    if (v) {
      started = false; startAudio(fromGesture); setTimeout(paint, 150);
      if (remember) arp([top() + 12, top() + 19], .045, .14);
    } else {
      started = false;
      if (ctx) { const t = now(); master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + .5); }
      if (unlockEl) try { unlockEl.pause(); } catch (e) {}
    }
    paint();
  }
  // cue pitch: pentatonic and in tune with the background
  const top = () => mode === "synth" ? CHORDS[Math.max(0, chord)].slice(-1)[0] : TRACKS[mode].chime[Math.max(0, chord)] - 12;
  const root = () => mode === "synth" ? 72 : TRACKS[mode].root;

  document.addEventListener("click", e => {
    const tg = e.target.closest("[data-sound-toggle]");
    if (tg) { setOn(!on, true, true); return; }
    if (!on) return;
    if (e.target.closest("[type=submit]:not(#va-send), .send-q")) { click(.12); whoosh(true, .05, .5); return; }
    if (e.target.closest("button, a, [role=button], summary, label, input[type=checkbox], input[type=radio], select")) click(.12);
  });
  // lighter ticks when the pointer moves onto menu items, links, chips and cards
  let hoverEl = null;
  document.addEventListener("pointerover", e => {
    if (!on || e.pointerType === "touch") return;
    const el = e.target.closest(".mnav a, .mnav button, #menu button, #menu a, .links button, .pill > button, .nav-cta > button, .chip, .rs-chip, .va-nav, .va-chip, .rs-card, .hl-card, .obtn, .btn, .apt, .apv");
    if (el && el !== hoverEl) { hoverEl = el; click(el.matches(".rs-card, .hl-card") ? .035 : .045, 1.25); } else if (!el) hoverEl = null;
  });
  // sound the visitor left on stays on: it starts again on their first tap, click or key on each page
  const wake = e => {
    if (!on || (e && e.target && e.target.closest && e.target.closest("[data-sound-toggle]"))) return;
    if (!ctx || ctx.state !== "running" || !started) { started = false; startAudio(true); setTimeout(paint, 150); setTimeout(paint, 600); }
  };
  ["pointerdown", "touchend", "click", "keydown"].forEach(ev => addEventListener(ev, wake, true));
  document.addEventListener("visibilitychange", () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (on) ctx.resume().catch(() => {}); });

  /* ---------- watch the page: pop-ups, pages, menu, detail views, success steps, assistant answers ---------- */
  const watch = new MutationObserver(list => {
    let coverChanged = false;
    list.forEach(m => {
      const el = m.target;
      if (m.attributeName === "open" && el.tagName === "DIALOG") {
        coverChanged = true;
        if (on) { if (el.open) { whoosh(true, .045, .6); arp([top() + 12, top() + 19], .04, .09); } else bell(top() + 7, .022); }
      }
      if (m.attributeName === "class") {
        const was = (m.oldValue || "").split(/\s+/), isOpen = el.classList.contains("open"), wasOpen = was.includes("open");
        if (isOpen !== wasOpen) {
          coverChanged = true;
          if (on) { if (isOpen) { whoosh(true, .07); shimmer(6, .022); bell(top() + 12, .03, .2); } else whoosh(false, .05); }
        }
      }
      if (m.attributeName === "hidden" && on && !el.hidden && el.querySelector(".ok:not(.soon-ic)")) arp([root(), root() + 4, root() + 7, root() + 12], .045, .1);   // success
      if (m.type === "childList" && on) m.addedNodes.forEach(n => {
        if (!(n instanceof Element)) return;
        if (n.matches(".va-msg-u")) { whoosh(true, .045, .45); }
        if (n.matches(".va-msg-a") && !n.querySelector(".va-typing")) { shimmer(5, .02); arp([top() + 12, top() + 19], .035, .12); }
      });
    });
    if (coverChanged) setCovered(coverCount());
  });
  // form messages: a gentle low tone when something needs fixing
  function watchErrors() {
    document.querySelectorAll("#a-msg, #ask-note, #cf-status, .msg, [aria-live]").forEach(el => new MutationObserver(() => {
      if (!on) return; const tx = (el.textContent || "").trim(); if (!tx) return;
      if (/enter|valid|first|try again|couldn|check|wrong|incorrect/i.test(tx)) { bell(69, .03, 0, 1.2); bell(64, .025, .12, 1.4); }   // A then E: in key for all three soundtracks
    }).observe(el, { childList: true, characterData: true, subtree: true }));
  }
  function observe() {
    document.querySelectorAll("dialog").forEach(d => watch.observe(d, { attributes: true, attributeFilter: ["open"] }));
    document.querySelectorAll(".pg, .rs-detail, .mnav, #menu").forEach(d => watch.observe(d, { attributes: true, attributeFilter: ["class"], attributeOldValue: true }));
    document.querySelectorAll(".stp").forEach(d => watch.observe(d, { attributes: true, attributeFilter: ["hidden"] }));
    const thread = document.getElementById("va-thread"); if (thread) watch.observe(thread, { childList: true, subtree: true });
    watchErrors();
  }

  /* sections of a normal page (Platform page): each section shifts the chord and the pulse density */
  function sections() {
    const secs = [...document.querySelectorAll("main section, body > section")].filter(s => s.offsetHeight > 200);
    if (!secs.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) api.chapter(secs.indexOf(en.target) % CHORDS.length, true); }), { threshold: .45 });
    secs.forEach(s => io.observe(s));
  }

  const api = {
    get on() { return on; },
    get mode() { return mode; },
    get state() { return ctx ? ctx.state : "none"; },
    chapter(i, quiet) {
      const changed = ctx && i !== chord;
      if (changed && on) { breathe(); whoosh(true, quiet ? .03 : .05, 1.1); shimmer(quiet ? 5 : 9, quiet ? .018 : .028); }
      setChord(i);
      if (changed && on) bell(top() + 12, quiet ? .022 : .04, .35, 3);
    },
    type() { key("char", true); },          // self-typing examples: lighter keys
    erase() { if (on) click(.02, 1.4); },
    chime() { bell(top() + 12, .04); },
    success() { arp([root(), root() + 4, root() + 7, root() + 12], .045, .1); }
  };
  window.vsSound = api;
  const ready = () => {
    if (wanted) {
      on = true;
      try {
        startAudio(false);
        setTimeout(() => { if (ctx && ctx.state !== "running" && !started) { try { ctx.close(); } catch (e) {} ctx = null; pad = []; CLICK = NOISE = WHITE = null; Object.values(TRACKS).forEach(tr => { tr.buf = tr.src = null; tr.loading = false; }); } paint(); }, 400);
      } catch (e) {}
    }
    paint(); observe(); if (document.body.dataset.soundSections !== undefined) sections(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
}
