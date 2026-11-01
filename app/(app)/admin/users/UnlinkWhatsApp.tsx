"use client";
import { useConfirm } from "../../Confirm";
import { unlinkUserWhatsApp } from "../actions";

// Removes a user's WhatsApp link; recorded in the activity log
export default function UnlinkWhatsApp({ id, name }: { id: string; name: string }) {
  const { guard, dialog } = useConfirm();
  return (
    <>
    {dialog}
    <form action={unlinkUserWhatsApp} onSubmit={guard({ title: `Unlink ${name}'s WhatsApp number?`, body: "Messages from it will no longer be answered.", action: "Unlink", danger: true })}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink hover:bg-brand-100">
        {"Unlink WhatsApp"}
      </button>
    </form>
    </>
  );
}
