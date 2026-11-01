"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

export type Ask = { title: string; body?: string; action: string; danger?: boolean };

// The app's confirmation box. confirm() opens it and resolves true or false. guard() is for a form's onSubmit: it holds
// the submit until the box is answered, then sends the form with the button that was pressed.
export function useConfirm() {
  const [open, setOpen] = useState<(Ask & { answer: (yes: boolean) => void }) | null>(null);
  const passed = useRef(false);
  const confirm = (ask: Ask) => new Promise<boolean>(resolve => setOpen({ ...ask, answer: resolve }));

  const guard = (ask: Ask | ((e: FormEvent<HTMLFormElement>) => Ask | null)) => (e: FormEvent<HTMLFormElement>) => {
    if (passed.current) { passed.current = false; return; }
    const question = typeof ask === "function" ? ask(e) : ask;
    if (!question) return;
    e.preventDefault();
    const form = e.currentTarget, submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    void confirm(question).then(yes => {
      if (!yes) return;
      passed.current = true;
      form.requestSubmit(submitter ?? undefined);
    });
  };

  const dialog: ReactNode = open && <ConfirmBox ask={open} onAnswer={yes => { open.answer(yes); setOpen(null); }} />;
  return { confirm, guard, dialog };
}

function ConfirmBox({ ask, onAnswer }: { ask: Ask; onAnswer: (yes: boolean) => void }) {
  const box = useRef<HTMLDialogElement>(null);
  useEffect(() => { box.current?.showModal(); }, []);
  return (
    <dialog ref={box} aria-labelledby="confirm-title" aria-describedby={ask.body ? "confirm-body" : undefined}
      onCancel={e => { e.preventDefault(); onAnswer(false); }}
      onClick={e => { if (e.target === box.current) onAnswer(false); }}
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-2xl border border-brand-200 bg-white p-0 text-left text-ink shadow-[0_40px_90px_-40px_#1F273F] backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]">
      <div className="grid gap-5 p-6">
        <div className="grid gap-2">
          <h2 id="confirm-title" className="text-[17px] leading-snug font-semibold whitespace-normal">{ask.title}</h2>
          {ask.body && <p id="confirm-body" className="text-sm leading-relaxed font-normal whitespace-normal text-brand-800">{ask.body}</p>}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" autoFocus className="btn btn-ghost" onClick={() => onAnswer(false)}>{"Cancel"}</button>
          <button type="button" className={`btn ${ask.danger ? "bg-danger hover:bg-[#912018]" : ""}`} onClick={() => onAnswer(true)}>{ask.action}</button>
        </div>
      </div>
    </dialog>
  );
}
