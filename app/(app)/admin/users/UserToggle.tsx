"use client";
import { useConfirm } from "../../Confirm";
import { setUserDisabled } from "../actions";

export default function UserToggle({ id, name, disabled }: { id: string; name: string; disabled: boolean }) {
  const { guard, dialog } = useConfirm();
  const ask = disabled
    ? { title: `Let ${name} sign in again?`, body: "If their monthly plan stopped renewing when you disabled them, it renews again.", action: "Re-enable" }
    : { title: `Disable ${name}?`, body: "They won't be able to sign in or use Verisavo until you re-enable them. A monthly plan stops renewing, and re-enabling turns it back on.", action: "Disable", danger: true };
  return (
    <>
    {dialog}
    <form action={setUserDisabled} onSubmit={guard(ask)}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="disable" value={disabled ? "0" : "1"} />
      <button type="submit" className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[13px] font-semibold ${disabled ? "text-ink hover:bg-brand-100" : "text-danger hover:bg-[#FEF3F2]"}`}>
        {disabled ? "Re-enable" : "Disable"}
      </button>
    </form>
    </>
  );
}
