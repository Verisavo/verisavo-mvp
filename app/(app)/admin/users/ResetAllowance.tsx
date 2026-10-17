"use client";
import { resetUserAllowance } from "../actions";

// Decision D10: give a user their allowance back (e.g. after a support issue); recorded in the activity log
export default function ResetAllowance({ id, name, paid }: { id: string; name: string; paid: boolean }) {
  const question = paid
    ? `Reset ${name}'s messages for this billing period to 0?`
    : `Give ${name} their free questions back?`;
  return (
    <form action={resetUserAllowance} onSubmit={e => { if (!window.confirm(question)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink hover:bg-brand-100">
        {"Reset allowance"}
      </button>
    </form>
  );
}
