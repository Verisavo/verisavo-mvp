"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Charts for the admin overview and the user dashboard. Colours come from chartColors.ts.
const GRID = "#E3EBF8", AXIS = { fontSize: 12, fill: "#3A5292" };

export type Series = { key: string; label: string; color: string };
type Point = { day: string } & Record<string, number | string>;

const shortDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

type TipProps = { active?: boolean; label?: string | number; series: Series[]; payload?: readonly { dataKey?: unknown; value?: unknown }[] };
function ChartTip({ active, payload, label, series }: TipProps) {
  if (!active || !payload?.length) return null;
  const value = (key: string) => Number(payload.find(p => p.dataKey === key)?.value ?? 0);
  return (
    <div className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-[13px] shadow-[0_18px_40px_-18px_#3A5292]">
      <p className="mb-1 font-semibold text-ink">{shortDay(String(label))}</p>
      {series.map(s => (
        <p key={s.key} className="flex items-center gap-2 text-brand-800">
          <span className="size-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
          {s.label}<b className="ml-auto pl-4 font-semibold text-ink tabular-nums">{value(s.key)}</b>
        </p>
      ))}
    </div>
  );
}

// Recharts measures the page, so it draws only in the browser; this keeps the space reserved until then
function ChartBox({ height, label, children }: { height: number; label: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <div role="img" aria-label={label} style={{ height }} className="min-w-0">{ready && children}</div>;
}

const axes = (compact: boolean, max: number) => (
  <>
    <CartesianGrid vertical={false} stroke={GRID} />
    <XAxis dataKey="day" tickFormatter={shortDay} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={compact ? 40 : 24} tickMargin={8} />
    <YAxis allowDecimals={false} domain={[0, Math.max(4, max)]} tick={AXIS} tickLine={false} axisLine={false} width={30} />
  </>
);
const peak = (data: Point[], series: Series[]) => Math.max(0, ...data.map(d => series.reduce((sum, s) => sum + Number(d[s.key] ?? 0), 0)));

function Legend({ series }: { series: Series[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[13px] text-brand-800">
      {series.map(s => <li key={s.key} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />{s.label}</li>)}
    </ul>
  );
}

// Change over time, stacked so the top line is the total
export function TrendChart({ data, series, label, height = 240 }: { data: Point[]; series: Series[]; label: string; height?: number }) {
  return (
    <div className="grid gap-3">
      {series.length > 1 && <Legend series={series} />}
      <ChartBox height={height} label={label}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
            <defs>
              {series.map(s => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
                </linearGradient>
              ))}
            </defs>
            {axes(false, peak(data, series))}
            <Tooltip content={p => <ChartTip active={p.active} label={p.label} payload={p.payload} series={series} />} cursor={{ stroke: "#A8C6E8" }} />
            {series.map(s => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stackId="1" stroke={s.color} strokeWidth={2} fill={`url(#fill-${s.key})`}
                activeDot={{ r: 5, fill: s.color, stroke: "#FFFFFF", strokeWidth: 2 }} animationDuration={500} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartBox>
    </div>
  );
}

// Counts per day, one series
export function ColumnChart({ data, series, label, height = 240 }: { data: Point[]; series: Series; label: string; height?: number }) {
  return (
    <ChartBox height={height} label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
          {axes(false, peak(data, [series]))}
          <Tooltip content={p => <ChartTip active={p.active} label={p.label} payload={p.payload} series={[series]} />} cursor={{ fill: "#E3EBF8", fillOpacity: 0.5 }} />
          <Bar dataKey={series.key} name={series.label} fill={series.color} maxBarSize={24} radius={[4, 4, 0, 0]} animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// One whole split into parts: each part's count is printed inside it when there's room, and always in the legend
export function SegmentedBar({ parts, label, empty }: { parts: { label: string; value: number; color: string; dark?: boolean }[]; label: string; empty: string }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const shown = parts.filter(p => p.value > 0);
  return (
    <div className="grid gap-2.5">
      {total ? (
        <div role="img" aria-label={`${label}: ${parts.map(p => `${p.label} ${p.value}`).join(", ")}`} className="flex h-7 gap-0.5">
          {shown.map(p => (
            <div key={p.label} title={`${p.label}: ${p.value} (${Math.round((p.value / total) * 100)}%)`} className="flex min-w-1 items-center overflow-hidden rounded px-2 text-xs font-semibold"
              style={{ width: `${(p.value / total) * 100}%`, background: p.color, color: p.dark ? "#1F273F" : "#FFFFFF" }}>
              {p.value / total >= 0.12 ? p.value : ""}
            </div>
          ))}
        </div>
      ) : <div className="flex h-7 items-center rounded bg-brand-100 px-2 text-xs text-brand-800">{empty}</div>}
      <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[13px] text-brand-800">
        {parts.map(p => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />{p.label}<b className="font-semibold text-ink tabular-nums">{p.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
