// Line icons from the original assistant window (20px grid, drawn with the .vi class)
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const Icon = ({ children, className = "", viewBox = "0 0 20 20", ...rest }: P) => (
  <svg className={`vi ${className}`} viewBox={viewBox} aria-hidden="true" {...rest}>{children}</svg>
);

export const Panel = (p: P) => <Icon {...p}><rect x="3" y="4" width="14" height="12" rx="2.5" /><path d="M8 4v12" /></Icon>;
export const Plus = (p: P) => <Icon {...p}><path d="M10 4v12M4 10h12" /></Icon>;
export const Search = (p: P) => <Icon {...p}><circle cx="9" cy="9" r="5.2" /><path d="M13 13l3.5 3.5" /></Icon>;
export const Pin = (p: P) => <Icon {...p}><path d="M10 17s-5-4.6-5-8.4a5 5 0 0 1 10 0C15 12.4 10 17 10 17z" /><circle cx="10" cy="8.6" r="1.8" /></Icon>;
export const Clock = (p: P) => <Icon {...p}><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5V10l2.5 1.6" /></Icon>;
export const Menu = (p: P) => <Icon {...p}><path d="M4 6h12M4 10h12M4 14h12" /></Icon>;
export const Chevron = (p: P) => <Icon {...p}><path d="M6 8l4 4 4-4" /></Icon>;
export const Sun = (p: P) => <Icon {...p}><circle cx="10" cy="10" r="3.2" /><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3L6 14M14 6l1.3-1.3" /></Icon>;
export const Moon = (p: P) => <Icon {...p}><path d="M15.5 12.3A6 6 0 0 1 7.7 4.5a6 6 0 1 0 7.8 7.8z" /></Icon>;
export const Shield = (p: P) => <Icon {...p}><path d="M10 3l5.5 2v4.6c0 3.4-2.3 5.9-5.5 7.4-3.2-1.5-5.5-4-5.5-7.4V5z" /><path d="M7.6 10.1l1.7 1.7 3.2-3.4" /></Icon>;
export const Pencil = (p: P) => <Icon {...p}><path d="M4 16h3l8.2-8.2a1.8 1.8 0 0 0-3-3L4 13z" /><path d="M11 6l3 3" /></Icon>;
export const Dots = ({ className = "", ...p }: P) => <Icon className={`fill-current stroke-none ${className}`} {...p}><circle cx="5" cy="10" r="1.1" /><circle cx="10" cy="10" r="1.1" /><circle cx="15" cy="10" r="1.1" /></Icon>;
export const Close = (p: P) => <Icon {...p}><path d="M5 5l10 10M15 5L5 15" /></Icon>;
export const ArrowUp = (p: P) => <Icon {...p}><path d="M10 15.5V5M5.5 9.5L10 5l4.5 4.5" /></Icon>;
export const Expand = (p: P) => <Icon {...p}><path d="M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4" /></Icon>;
export const Shrink = (p: P) => <Icon {...p}><path d="M8 4v4H4M12 4v4h4M8 16v-4H4M12 16v-4h4" /></Icon>;
export const Gear = (p: P) => (
  <Icon viewBox="0 0 24 24" style={{ strokeWidth: 1.7 }} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);
