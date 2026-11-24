/** Fills `{name}` placeholders. An unknown name stays as written. */
export const fill = (s: string, values: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
