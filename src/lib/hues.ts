import type { Hue } from "../site.config";

const HUES: Hue[] = ["indigo", "cyan", "emerald", "amber", "rose", "violet"];

export function hueAt(index: number): Hue {
  return HUES[index % HUES.length] ?? "indigo";
}
