"use client";
import { unlinkUserWhatsApp } from "../actions";

// Removes a user's WhatsApp link; recorded in the activity log
export default function UnlinkWhatsApp({ id, name }: { id: string; name: string }) {
  return (
    <form action={unlinkUserWhatsApp} onSubmit={e => { if (!window.confirm(`Unlink ${name}'s WhatsApp number? Messages from it will no longer be answered.`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink hover:bg-brand-100">
        {"Unlink WhatsApp"}
      </button>
    </form>
  );
}
