"use client";
import { useConfirm } from "../../Confirm";
import { resetUserAllowance } from "../actions";

// Decision D10: give a user their allowance back (e.g. after a support issue); recorded in the activity log
export default function ResetAllowance({ id, name, paid }: { id: string; name: string; paid: boolean }) {
  const { guard, dialog } = useConfirm();
  const ask = paid
    ? { title: `Reset ${name}'s messages?`, body: "Their count for this billing period goes back to 0. This is recorded in the activity log.", action: "Reset messages" }
    : { title: `Give ${name} their free questions back?`, body: "This is recorded in the activity log.", action: "Give them back" };
  return (
    <>
    {dialog}
    <form action={resetUserAllowance} onSubmit={guard(ask)}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink hover:bg-brand-100">
        {"Reset allowance"}
      </button>
    </form>
    </>
  );
}
